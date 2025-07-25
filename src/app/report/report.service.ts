import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
 
export interface BuoyMeasurement {
  id?: number;
  [key: string]: any;
  station_id: string;
  timestamp: string; // ISO string
  datetime: string;
  battery: number;
  cam_img: string;
  lat: number;
  lon: number;
  wind_speed: number;
  wind_direction_deg: number;
  temperature_deg: number;
  rh_percent: number;
  bp_hpa: number;
  global: number;
  rain_mm: number;
  visibility_nm: number;
  wave_heading: number;
  wave_height: number;
  tzc: number;
  tz: number;
  tm02: number;
  wave_direction: number;
  wave_direction_fw: number;
  mean_wave_direction: number;
  hmax: number;
  fourier_coefficient_a1: number;
  fourier_coefficient_b1: number;
  fourier_coefficient_a2: number;
  fourier_coefficient_b2: number;
  havg: number;
  dominant_time_period_fw: number;
  turbidity: number;
  water_temperature: number;
  ph: number;
  conductivity: number;
  dissolved_oxygen: number;
  salinity: number;
  chlorophyll_a: number;
  wind_gust: number;
  phycoerythrin: number;
  fluorescein_dye: number;
  pah: number;
  oil_in_water: number;
  bt: number;
  current_speed_bin_1: number;
  current_direction_bin_1: number;
  current_speed_bin_2: number;
  current_direction_bin_2: number;
  current_speed_bin_3: number;
  current_direction_bin_3: number;
  current_speed_bin_4: number;
  current_direction_bin_4: number;
  current_speed_bin_5: number;
  current_direction_bin_5: number;
  current_speed_bin_6: number;
  current_direction_bin_6: number;
  current_speed_bin_7: number;
  current_direction_bin_7: number;
  current_speed_bin_8: number;
  current_direction_bin_8: number;
  current_speed_bin_9: number;
  current_direction_bin_9: number;
  current_speed_bin_10: number;
  current_direction_bin_10: number;
}
 
export interface Metrological {
  id: number;
  timestamp: string; // ISO string format, e.g., '2025-04-09T10:30:00Z'
  wind_speed: number; // m/s
  wind_direction: number; // degrees
  wind_gust: number; // m/s
  temperature: number; // °C
  rh: number; // Relative Humidity (%)
  bp: number; // Barometric Pressure (hPa)
  radiation: number;
}
 
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = 'http://192.168.0.6:3000/api/';
 
  constructor(private http: HttpClient) {}
 
  getAllSensorData(): Observable<BuoyMeasurement[]> {
    return this.http.get<BuoyMeasurement[]>(`${this.apiUrl}getAllSensorData`);
  }
 
  getAllSensorDatabyStation(stationId: string): Observable<BuoyMeasurement[]> {
    return this.http.get<BuoyMeasurement[]>(
      `${this.apiUrl}getAllSensorDatabyStation/${stationId}`
    );
  }
 
  getMetrologicalData(): Observable<Metrological[]> {
    return this.http.get<Metrological[]>(`${this.apiUrl}getMetrologicalData`);
  }
 
  fetchDataByDate(
    fromDate: string,
    toDate: string
  ): Observable<BuoyMeasurement[]> {
    return this.http.get<BuoyMeasurement[]>(
      `${this.apiUrl}getSensorDataByDate?fromDate=${fromDate}&toDate=${toDate}`
    );
  }
 
  getSensorDataByStationAndDate(
    stationId: string,
    fromDate: string,
    toDate: string
  ): Observable<BuoyMeasurement[]> {
    return this.http.get<BuoyMeasurement[]>(
      `${this.apiUrl}getSensorDataByStationAndDate?stationId=${stationId}&fromDate=${fromDate}&toDate=${toDate}`
    );
  }

 
 

     getAllstationData(stationId: string, fromDate:string, ToDate:string): Observable<BuoyMeasurement[]> {
    const params = new HttpParams()
    .set('fromDate',fromDate)
    .set('toDate',ToDate)
    .set('station_id', stationId);
    return this.http.get<BuoyMeasurement[]>(
      `${this.apiUrl}getSensorDataByDate`,{params}
    );
  }
}
 
 