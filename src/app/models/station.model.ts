export interface BuoyMeasurement {
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
    heading: number;
    hs: number;
    dominant_time_period: number;
    pmax: number;
    apd: number;
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
  


export interface SensorModel{

danger:string;
id:number;
name:string;
notification:string;
param_name:string;
timestamp:string;
unit:string;
warning:string;
}