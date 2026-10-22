import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BuoyMeasurement } from '../report/report.service';

export interface LiveSensorPayload {
  type: string;
  timestamp: string;
  data: BuoyMeasurement[];
  byStation: { [stationId: string]: BuoyMeasurement };
  stationsConfig: any[];
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private reconnectInterval: number = 3000;
  private isConnecting: boolean = false;

  private liveDataSubject = new BehaviorSubject<LiveSensorPayload | null>(null);
  public liveData$ = this.liveDataSubject.asObservable();

  public allStations$: Observable<BuoyMeasurement[]> = this.liveData$.pipe(
    filter((payload): payload is LiveSensorPayload => payload !== null && Array.isArray(payload.data)),
    map(payload => payload.data)
  );

  constructor(private ngZone: NgZone) {
    this.connect();
  }

  private getSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    // API server runs on port 3000
    return `${protocol}//${host}:3000`;
  }

  public connect(): void {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const url = this.getSocketUrl();
    console.log('[WebsocketService] Connecting to:', url);

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        console.log('[WebsocketService] Connected to real-time sensor WebSocket');
        // Request immediate state
        this.sendMessage({ action: 'GET_LATEST' });
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && (payload.type === 'LIVE_SENSOR_DATA' || payload.data)) {
            this.ngZone.run(() => {
              this.liveDataSubject.next(payload);
            });
          }
        } catch (err) {
          console.error('[WebsocketService] Error parsing incoming message:', err);
        }
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        console.warn(`[WebsocketService] Disconnected. Reconnecting in ${this.reconnectInterval / 1000}s...`);
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (err) => {
        this.isConnecting = false;
        console.error('[WebsocketService] WebSocket error:', err);
        try {
          this.socket.close();
        } catch (_) {}
      };
    } catch (e) {
      this.isConnecting = false;
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  public getStationLive$(stationId: string): Observable<BuoyMeasurement | null> {
    return this.liveData$.pipe(
      map(payload => {
        if (!payload || !payload.byStation || !stationId) return null;
        const normalized = stationId.trim();
        return payload.byStation[normalized] ||
               payload.byStation[normalized.toUpperCase()] ||
               payload.byStation[normalized.toLowerCase()] ||
               null;
      })
    );
  }

  public getLatestSnapshot(): LiveSensorPayload | null {
    return this.liveDataSubject.value;
  }
}
