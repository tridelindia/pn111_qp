import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { LeakIntrusionAlert } from '../models/station.model';
import { ReportService } from '../report/report.service';
import { StationConfigs, StationconfigService } from '../home/homeService/stationconfig.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class LeakAlertService {
  private alertsSubject = new BehaviorSubject<LeakIntrusionAlert[]>([]);
  public alerts$: Observable<LeakIntrusionAlert[]> = this.alertsSubject.asObservable();

  private dismissedAlertIds = new Set<string>();
  private stationsConfig: StationConfigs[] = [];
  private wsSub?: Subscription;

  constructor(
    private reportService: ReportService,
    private stationConfigService: StationconfigService,
    private wsService: WebsocketService
  ) {
    this.init();
  }

  private init(): void {
    // 1. Fetch station names mapping
    this.stationConfigService.getStationNames().subscribe({
      next: (configs) => {
        this.stationsConfig = configs || [];
        this.updateAlertStationNames();
      },
      error: (err) => console.error('[LeakAlertService] Error fetching station names:', err)
    });

    // 2. Initial check of all sensor data from API
    this.reportService.getAllSensorData().subscribe({
      next: (data) => {
        this.processSensorData(data);
      },
      error: (err) => console.error('[LeakAlertService] Error fetching initial sensor data:', err)
    });

    // 3. Real-time WebSocket updates across all pages (Home, Dashboard, Analytics, etc.)
    this.wsSub = this.wsService.liveData$.subscribe((payload) => {
      if (!payload) return;

      if (payload.stationsConfig && payload.stationsConfig.length > 0 && this.stationsConfig.length === 0) {
        this.stationsConfig = payload.stationsConfig;
        this.updateAlertStationNames();
      }

      if (payload.data && Array.isArray(payload.data)) {
        this.processSensorData(payload.data);
      }
    });
  }

  public processSensorData(data: any[]): void {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    const currentAlerts = [...this.alertsSubject.value];
    let changed = false;

    data.forEach((item) => {
      if (!item) return;

      const rawStationId = (item.station_id || item.stationId || '').toString().trim();
      if (!rawStationId) return;

      // Normalize station ID to uppercase to avoid m22 vs M22 duplicates
      const normStationId = rawStationId.toUpperCase();
      const matched = this.stationsConfig.find(
        (b) => (b.station_id || '').toUpperCase() === normStationId
      );
      const stationName =
        matched?.station_name ||
        item.station_name ||
        item.stationName ||
        normStationId;

      // Check leak_detection (1 indicates leak detected, 0 or null is normal)
      const leakVal = item.leak_detection ?? item.Leak_Detection ?? item.leakDetection;
      const isLeak = leakVal !== null && leakVal !== undefined && Number(leakVal) === 1;

      // Check intrusion_detection (1 indicates intrusion detected, 0 or null is normal)
      const intrusionVal = item.intrusion_detection ?? item.Intrusion_Detection ?? item.intrusionDetection;
      const isIntrusion = intrusionVal !== null && intrusionVal !== undefined && Number(intrusionVal) === 1;

      // Unique alert ID per station ensures each station has at most 1 notification
      const alertId = `station_${normStationId}`;

      if (isLeak || isIntrusion) {
        // If user already dismissed this station's alert, do not re-add
        if (
          this.dismissedAlertIds.has(alertId) ||
          this.dismissedAlertIds.has(normStationId) ||
          this.dismissedAlertIds.has(rawStationId)
        ) {
          return;
        }

        // Use item.datetime from DB (handled as raw string via pg typeParser) with fallback to timestamp
        const formattedTime = this.formatTimestamp(item.datetime || item.timestamp);

        let type: 'leak' | 'intrusion' = 'intrusion';
        let badge = 'Intrusion Alert';
        let title = 'Intrusion Detected';
        let message = 'Perimeter security sensor triggered on buoy.';

        if (isLeak && isIntrusion) {
          type = 'intrusion';
          badge = 'Leak & Intrusion';
          title = 'Leak & Intrusion Detected';
          message = 'Water ingress and perimeter sensors triggered.';
        } else if (isLeak) {
          type = 'leak';
          badge = 'Water Leak';
          title = 'Water Leak Detected';
          message = 'Internal moisture sensor triggered inside hull.';
        } else {
          type = 'intrusion';
          badge = 'Intrusion Alert';
          title = 'Intrusion Detected';
          message = 'Perimeter security sensor triggered on buoy.';
        }

        const alertObj: LeakIntrusionAlert = {
          id: alertId,
          stationId: normStationId,
          stationName,
          type,
          badge,
          title,
          message,
          time: formattedTime
        };

        // Enforce strictly 1 notification per station: check if this station already has an alert
        const existingIdx = currentAlerts.findIndex(
          (a) =>
            (a.stationId || '').toUpperCase() === normStationId ||
            a.id === alertId ||
            (a.id || '').toUpperCase().startsWith(`STATION_${normStationId}`) ||
            (a.id || '').toUpperCase().startsWith(`${normStationId}_`)
        );

        if (existingIdx >= 0) {
          // Update the existing alert in place without creating a duplicate notification card
          currentAlerts[existingIdx] = alertObj;
          changed = true;
        } else {
          // Add new alert for this station
          currentAlerts.push(alertObj);
          changed = true;
        }
      }
    });

    if (changed) {
      this.alertsSubject.next(currentAlerts);
    }
  }

  private formatTimestamp(raw?: any): string {
    if (!raw) {
      return '';
    }

    if (typeof raw === 'string') {
      const clean = raw.trim();

      // 1. If string matches YYYY-MM-DD HH:mm (or with T/seconds, e.g. "2026-11-14 15:10:00")
      const match = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2}):(\d{1,2})/);
      if (match) {
        const [, y, m, d, hh, mm] = match;
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y} ${hh}:${mm}`;
      }

      // 2. If already in DD-MM-YYYY format
      const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})[T\s](\d{1,2}):(\d{1,2})/);
      if (dmyMatch) {
        const [, d, m, y, hh, mm] = dmyMatch;
        return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y} ${hh}:${mm}`;
      }

      // Fallback: slice string directly like the old logic
      if (clean.includes('T')) {
        return clean.replace('T', ' ').slice(0, 16);
      }
      return clean.slice(0, 16);
    }

    // Fallback if Date object
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(raw.getDate())}-${pad(raw.getMonth() + 1)}-${raw.getFullYear()} ${pad(raw.getHours())}:${pad(raw.getMinutes())}`;
    }

    return String(raw);
  }

  private updateAlertStationNames(): void {
    if (!this.stationsConfig || this.stationsConfig.length === 0) return;
    const currentAlerts = [...this.alertsSubject.value];
    let changed = false;

    currentAlerts.forEach((alert) => {
      const match = this.stationsConfig.find(
        (b) => (b.station_id || '').toUpperCase() === (alert.stationId || '').toUpperCase()
      );
      if (match && match.station_name && match.station_name !== alert.stationName) {
        alert.stationName = match.station_name;
        changed = true;
      }
    });

    if (changed) {
      this.alertsSubject.next(currentAlerts);
    }
  }

  public dismissAlert(alert: LeakIntrusionAlert): void {
    const normStationId = (alert.stationId || alert.id).toUpperCase();
    this.dismissedAlertIds.add(alert.id);
    this.dismissedAlertIds.add(normStationId);
    this.dismissedAlertIds.add(`station_${normStationId}`);
    const updated = this.alertsSubject.value.filter(
      (a) =>
        a.id !== alert.id &&
        (a.stationId || '').toUpperCase() !== normStationId &&
        !(a.id || '').toUpperCase().startsWith(`STATION_${normStationId}`) &&
        !(a.id || '').toUpperCase().startsWith(`${normStationId}_`)
    );
    this.alertsSubject.next(updated);
  }
}
