import { Component, OnInit } from '@angular/core';
import { RadialGaugeComponent } from '../../widgets/radial-guage/radial-guage.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { text } from 'express';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';
import { LoggingService } from '../../users/service/users/logging.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
 
interface Sensors {
  id: number;
  timestamp: string;
  name: string;
  param_name: string;
  unit: string;
  warning: string;
  danger: string;
  notification: string;
}
@Component({
  selector: 'app-sensor',
  imports: [
    RadialGaugeComponent,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MultiSelectModule,
    ToastrModule
  ],
  standalone: true,
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.css',
  providers: [LoggingService]
})
export class SensorComponent implements OnInit {
  selectedSensor: string = 'ocean';
  tableData?: Sensors[];
  mainToggle: boolean = false;
  editData!: Sensors;
  isMulti: boolean = false;
  isFirst: number = 1;
  selectedUnit: string = 'µg/L';
  multiData: string[] = [];
wave_direction: string[] = ['°'];
mean_wave_direction: string[] = ['°'];
dominant_time_period_fw: string[] = ['s'];
havg: string[] = ['m', 'ft'];
current_direction: string[] = ['°'];
wind_speed: string[] = ['m/s', 'km/h', 'knots'];
wind_gust: string[] = ['m/s', 'km/h', 'knots'];
visibility: string[] = ['m', 'km', 'NM'];
turbidity: string[] = ['NTU', 'FNU'];
conductivity: string[] = ['µS/cm', 'mS/cm'];
chlorophyll_a: string[] = ['µg/L', 'mg/m³', 'RFU'];
dissolved_oxygen: string[] = ['mg/L', '%'];
fluorescein_dye: string[] = ['ppb', 'µg/L'];
oil_in_water: string[] = ['mg/L', 'ppm', 'ppb'];
hmax: string[] = ['m', 'ft'];
rh_percent: string[] = ['%'];
rain_mm: string[] = ['mm', 'cm'];
global_radiation: string[] = ['W/m²'];
tm02: string[] = ['s'];
wind_direction_deg: string[] = ['°'];
bp_hpa: string[] = ['hPa', 'mb'];
temperature_deg: string[] = ['°C', '°F', 'K'];
pah: string[] = ['µg/L', 'ppb', 'ppm'];
water_temperature: string[] = ['°C', '°F'];
tz: string[] = ['s'];
battery: string[] = ['V', '%'];
salinity: string[] = ['PSU', 'ppt', 'g/kg'];
ph: string[] = ['pH'];
phycoerythrin: string[] = ['µg/L', 'RFU'];
tzc: string[] = ['s'];
fourier_coefficient_a1: string[] = ['unitless'];
current_speed: string[] = ['m/s', 'cm/s', 'knots'];
wave_height: string[] = ['m', 'ft', 'cm'];
bt: string[] = ['µg/L', 'ppb'];
fourier_coefficient_a2: string[] = ['unitless'];
wave_heading: string[] = ['°'];


    bin1!:string;
    bin2!:string;
    bin3!:string;
    bin4!:string;

  // parameterOptions = [
  //   { name: 'Water Temperature' },
  //   { name: 'pH Level' },
  //   { name: 'Dissolved Oxygen' },
  //   { name: 'Salinity' },
  //   { name: 'Turbidity' },
  //   { name: 'Conductivity' },
  //   { name: 'Nitrate' },
  //   { name: 'Ammonia' },
  //   { name: 'Phosphate' },
  //   { name: 'Chlorophyll' },
  // ];
 
  stationNames: any = [];
  paramNames: any = [];
  paramNames2: any = [];
 
  stations: any[] = []; // Includes id, name, selectedParameters, limitReached
 unitMap: { [key: string]: string[] } = {
  wave_direction: ['°'],
  mean_wave_direction: ['°'],
  dominant_time_period_fw: ['s'],
  havg: ['m', 'ft'],
  current_direction: ['°'],
  wind_speed: ['m/s', 'km/h', 'knots'],
  wind_gust: ['m/s', 'km/h', 'knots'],
  visibility: ['m', 'km', 'NM'],
  turbidity: ['NTU', 'FNU'],
  conductivity: ['µS/cm', 'mS/cm'],
  chlorophyll_a: ['µg/L', 'mg/m³', 'RFU'],
  dissolved_oxygen: ['mg/L', '%'],
  fluorescein_dye: ['ppb', 'µg/L'],
  oil_in_water: ['mg/L', 'ppm', 'ppb'],
  hmax: ['m', 'ft'],
  rh_percent: ['%'],
  rain_mm: ['mm', 'cm'],
  global_radiation: ['W/m²'],
  tm02: ['s'],
  wind_direction_deg: ['°'],
  bp_hpa: ['hPa', 'mb'],
  temperature_deg: ['°C', '°F', 'K'],
  pah: ['µg/L', 'ppb', 'ppm'],
  water_temperature: ['°C', '°F'],
  tz: ['s'],
  battery: ['V', '%'],
  salinity: ['PSU', 'ppt', 'g/kg'],
  ph: ['pH'],
  phycoerythrin: ['µg/L', 'RFU'],
  tzc: ['s'],
  fourier_coefficient_a1: [''],
  current_speed: ['m/s', 'cm/s', 'knots'],
  wave_height: ['m', 'ft', 'cm'],
  bt: ['µg/L', 'ppb'],
  fourier_coefficient_a2: [''],
  wave_heading: ['°'],
  temperature: ['°C', '°F', 'K'],
  rainfall: ['mm', 'cm']
};

getLabelPrefix(name: string): string {
    switch (name) {
      case 'battery':
        return 'Battery';
      case 'cam_img':
        return 'Camera';
      case 'lat':
        return 'Latitude';
      case 'lon':
        return 'Longitude';
      case 'wind_speed':
        return `Wind\nSpeed`;
      case 'wind_direction_deg':
        return 'Wind\nDirection';
      case 'wind_gust':
        return 'Wind\nGust';
      case 'temperature_deg':
        return 'Air\nTemperature';
      case 'rh_percent':
        return 'Relative\nHumidity';
      case 'bp_hpa':
        return 'Barometric\nPressure';
      case 'global_radiation':
        return 'Radiation';
      case 'rain_mm':
        return 'Rainfall';
      case 'visibility':
        return 'Visibility';
 
      case 'wave_heading':
        return 'Wave\nHeading';
      case 'wave_height':
        return 'Wave\nHeight';
      case 'tzc':
        return 'Peak Wave\nPeriod';
      case 'tz':
        return 'Zero-crossing\nPeriod';
      case 'tm02':
        return 'Average\nWave\nPeriod';
      case 'wave_direction':
        return 'Wave\nDirection';
      case 'wave_direction_fw':
        return 'Wave\nDirection FW';
      case 'mean_wave_direction':
        return 'Mean Wave\nDirection';
      case 'hmax':
        return 'Max Wave\nHeight';
      case 'fourier_coefficient_a1':
        return 'Fourier\nCo_a1';
      case 'fourier_coefficient_b1':
        return 'Fourier\nCo_b1';
      case 'fourier_coefficient_a2':
        return 'Fourier\nCo_a2';
      case 'fourier_coefficient_b2':
        return 'Fourier\nCo_b2';
      case 'havg':
        return 'Average\nWave\nHeight';
      case 'dominant_time_period_fw':
        return 'Dominant\nPeriod FW';
 
      case 'turbidity':
        return 'Turbidity';
      case 'water_temperature':
        return 'Water\nTemperature';
      case 'ph':
        return 'potential\nof Hydrogen';
      case 'conductivity':
        return 'Conductivity';
      case 'dissolved_oxygen':
        return 'Dissolved\nOxygen';
      case 'salinity':
        return 'Salinity';
      case 'chlorophyll_a':
        return 'Chlorophyll-a';
      case 'phycoerythrin':
        return 'Phycoerythrin';
      case 'fluorescein_dye':
        return 'Fluorescein\nDye';
      case 'pah':
        return 'PAH';
      case 'oil_in_water':
        return 'Oil in\nWater';
      case 'bt':
        return 'Bottom\nTemperature';
 
      // Current speed bins
      case 'current_speed_bin_1':
      case 'current_speed_bin_2':
      case 'current_speed_bin_3':
      case 'current_speed_bin_4':
      case 'current_speed_bin_5':
      case 'current_speed_bin_6':
      case 'current_speed_bin_7':
      case 'current_speed_bin_8':
      case 'current_speed_bin_9':
      case 'current_speed_bin_10':
        return 'Current\nSpeed';
 
      // Current direction bins
      case 'current_direction_bin_1':
      case 'current_direction_bin_2':
      case 'current_direction_bin_3':
      case 'current_direction_bin_4':
      case 'current_direction_bin_5':
      case 'current_direction_bin_6':
      case 'current_direction_bin_7':
      case 'current_direction_bin_8':
      case 'current_direction_bin_9':
      case 'current_direction_bin_10':
        return 'Current\nDirection';
 
      default:
        return '';
    }
  }


  constructor(private http: HttpClient, private loggingService: LoggingService, private toast:ToastrService) {}
  ngOnInit(): void {
    const stat = this.saveData();
    this.getStationConfig();
  }
 
 // saveData() {
  //   try {
  //     this.http.get('http://192.168.0.19:3000/api/getSensorConfig').subscribe(
  //       (response: any) => {
  //         console.log('sensorvalise', response);
  //         this.sampleData = response;
  //         this.paramNames = this.sampleData.map((name: any) => name.param_name);
  //         console.log('Extracted param_names:', this.paramNames);
  //         this.tableData = this.sampleData.filter(
  //           (item) => item.name === 'oceanography'
  //         );
  //         console.log(this.tableData);
  //         if (this.isFirst === 1) {
  //           this.onEdit(this.tableData[0]);
  //         }
  //         this.isFirst = this.isFirst + 1;
  //         // return true;
  //       },
 
  //       (error) => {
  //         console.error(error);
  //         // return false;
  //       }
  //     );
  //     this.http
  //       .get('http://192.168.0.19:3000/api/getBin')
  //       .subscribe((response: any) => {
  //         console.log('binsss', response);
  //         this.bin1 = response[0].value;
  //         this.bin2 = response[1].value;
  //         this.bin3 = response[2].value;
  //         this.bin4 = response[3].value;
  //       });
  //     // return true
  //   } catch (error) {
  //     // return false
  //   }
  // }
 mainSensor:Sensors[]=[]
  saveData() {
    try {
      this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
        (response: any) => {
          console.log('sensorvalise', response);
 
          // Filter out unwanted parameters
          this.mainSensor= response;
          this.sampleData = response.filter(
            (item: any) =>
              item.param_name !== 'current_speed' &&
              item.param_name !== 'current_direction'
          );
 
          this.paramNames = this.sampleData.map((name: any) => name.param_name);
          console.log('Extracted param_names:', this.paramNames);

          this.paramNames2 = this.sampleData.map((item:any) => ({
            label: this.getLabelPrefix(item.param_name),
            value: item.param_name
          })) 
          
 
          this.tableData = this.mainSensor.filter(
            (item) => item.name === 'oceanography'
          );
          console.log(this.tableData);
 
          if (this.isFirst === 1) {
            this.onEdit(this.tableData[1]);
          }
          this.isFirst = this.isFirst + 1;
          this.getStationConfig();
        },
        (error) => {
          console.error(error);
        }
      );
 
      this.http
        .get('http://localhost:3000/api/getBin')
        .subscribe((response: any) => {
          console.log('binsss', response);
          this.bin1 = response[0].value;
          this.bin2 = response[1].value;
          this.bin3 = response[2].value;
          this.bin4 = response[3].value;
        });
    } catch (error) {
      console.error(error);
    }
  }
 
 
  Update() {

    this.http
      .post('http://localhost:3000/api/updateSensor', this.editData)
      .subscribe(
        (response: any) => {
          console.log(response);
          this.saveData();
          // Add log
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            this.loggingService.addLog(
              currentUser.username,
              `Sensor has been updated`, 
              currentUser.id,
              'SE002',
              'sensor.component.ts/updateSensor'
            ).subscribe({
              next: () => console.log('Activity logged successfully'),
              error: (err) => console.error('Failed to log activity', err)
            });

          }
          this.toast.success('Parameter values updated', 'Success');
        },
        (error) => {
          console.error(error);
        }
      );

      if(this.editData.param_name.includes('current')){
        const bins =[
          {"id": 1, "value": this.bin1},
          {"id": 2, "value": this.bin2},
          {"id": 3, "value": this.bin3},
          {"id": 4, "value": this.bin4}
        ]
        this.http.post('http://localhost:3000/api/updatebinss', {bins}).subscribe(
          (response:any)=>{
            console.log("bins", response);
            
          this.saveData();
          }
        )
      }
  }
 
  onUnitSelect(unit: string) {
    this.selectedUnit = unit;
    this.editData.unit = unit;
  }
  onEdit(item: any) {
  this.editData = item;
  this.mainToggle = item.notification === 'enabled';
  console.log(this.editData);

  const unitOptions = this.unitMap[item.param_name];

  if (unitOptions) {
    this.isMulti = true;
    this.multiData = unitOptions;
  } else {
    this.isMulti = false;
  }

  this.selectedUnit = item.unit;
}

 
  toggle() {
    this.mainToggle = !this.mainToggle;
  }
  onSensorSelect(name: string) {
    this.selectedSensor = name;
    if (name === 'ocean') {
      this.tableData = this.sampleData.filter(
        (item) => item.name === 'oceanography'
      );
    } else if (name === 'met') {
      this.tableData = this.sampleData.filter(
        (item) => item.name === 'meteorology'
      );
    } else if (name === 'wat') {
      this.tableData = this.sampleData.filter(
        (item) => item.name === 'water_quality'
      );
    } else if (name === 'mic') {
      this.tableData = this.sampleData.filter(
        (item) => item.name === 'microflu'
      );
    }
  }
  sampleData: Sensors[] = [];
 
  getStationConfig() {
    this.http
      .get('http://localhost:3000/api/getHomeConfig')
      .subscribe((data: any) => {
        this.stations = data.map((item: any) => {
          const selected = [
            item.param1,
            item.param2,
            item.param3,
            item.param4,
            item.param5,
          ].filter((p) => !!p); // avoid nulls
 
          return {
            id: item.id,
            station_id: item.station_id,
            name: item.station_id,
            selectedParameters: selected,
            limitReached: false,
          };
        });
 
        console.log('Stations with selected parameters:', this.stations);
        this.stations.forEach((s, i) => {
          console.log(
            `Station ${i} (${s.name}) selected:`,
            s.selectedParameters
          );
        });
      });
  }
 
 
  updateHomeConfig(station: any) {
    const params = [...station.selectedParameters];
 
    while (params.length < 5) {
      params.push(null);
    }
 
    const payload = {
      station_id: station.station_id,
      param1: params[0],
      param2: params[1],
      param3: params[2],
      param4: params[3],
      param5: params[4],
    };
 
    console.log('Updating station with payload:', payload);
 
    this.http
      .put('http://localhost:3000/api/updateHomeConfig', payload)
      .subscribe({
        next: (res) => {
          console.log('Update successful:', res);
          this.getStationConfig(); // refresh UI
          this.toast.success('Parameter values updated', 'Success');
        },
        error: (err) => {
          console.error('Update failed:', err);
        },
      });
  }
 
  onParamChange(station: any) {
    if (station.selectedParameters.length > 5) {
      station.limitReached = true;
      station.selectedParameters.pop(); // prevent selecting more than 5
    } else {
      station.limitReached = false;
    }
  }

}
 
 