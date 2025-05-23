// global-data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BuoyData {
  id?: number;
  station_id: string;
  timestamp: string; // ISO string
  datetime: string;
  battery: number;
  cam_img: string;
  lat: number;
  lon: number;
  windspeed_knots: number;
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
  chlorophyll_a_blue: number;
  chlorophyll_a_red: number;
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

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  selectedStation:any = {};
  index!:number;
  isDashboardLoad:boolean = false;
  
  private stationIdSubject = new BehaviorSubject<string>('');
  stationId$ = this.stationIdSubject.asObservable();

  setStationId(stationId: string) {
    this.stationIdSubject.next(stationId);
  }

  getStationId(): string {
    return this.stationIdSubject.value;
  }

  initializeStationId(stationId: string) {
    if (!this.stationIdSubject.value) {
      this.stationIdSubject.next(stationId);
    }
  }

  // onChangeDashboard(id:){}
}
