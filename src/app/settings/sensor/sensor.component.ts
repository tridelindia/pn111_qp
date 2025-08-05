import { Component, OnInit } from '@angular/core';
import { RadialGaugeComponent } from '../../widgets/radial-guage/radial-guage.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { text } from 'express';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';
import { LoggingService } from '../../users/service/users/logging.service';
 
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
  PAH: string[] = ['µg/L', 'ppb', 'ppm'];
  oil_in_water: string[] = ['mg/L', 'ppm', 'ppb'];
  BT: string[] = ['µg/L', 'ppb'];
  chlorophyll_a: string[] = ['µg/L', 'RFU'];
  salinity: string[] = ['PSU', 'ppt', 'g/kg'];
  wind_speed: string[] = ['m/s', 'km/h', 'knots'];
  wind_gust: string[] = ['m/s', 'km/h', 'knots'];
  temperature: string[] = ['°C', '°F', 'K'];
  rainfall: string[] = ['mm', 'cm'];
  current_speed: string[] = ['m/s', 'cm/s', 'knots'];

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
 
  stations: any[] = []; // Includes id, name, selectedParameters, limitReached
 
  constructor(private http: HttpClient, private loggingService: LoggingService) {}
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
 
  saveData() {
    try {
      this.http.get('http://192.168.0.5:3000/api/getSensorConfig').subscribe(
        (response: any) => {
          console.log('sensorvalise', response);
 
          // Filter out unwanted parameters
          this.sampleData = response.filter(
            (item: any) =>
              item.param_name !== 'current_speed' &&
              item.param_name !== 'current_direction'
          );
 
          this.paramNames = this.sampleData.map((name: any) => name.param_name);
          console.log('Extracted param_names:', this.paramNames);
 
          this.tableData = this.sampleData.filter(
            (item) => item.name === 'oceanography'
          );
          console.log(this.tableData);
 
          if (this.isFirst === 1) {
            this.onEdit(this.tableData[0]);
          }
          this.isFirst = this.isFirst + 1;
        },
        (error) => {
          console.error(error);
        }
      );
 
      this.http
        .get('http://192.168.0.5:3000/api/getBin')
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
      .post('http://192.168.0.5:3000/api/updateSensor', this.editData)
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
        this.http.post('http://192.168.0.5:3000/api/updatebinss', {bins}).subscribe(
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
    if (item.param_name === 'PAH') {
      this.isMulti = true;
      this.multiData = this.PAH;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'oil_in_water') {
      this.isMulti = true;
      this.multiData = this.oil_in_water;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'BT') {
      this.isMulti = true;
      this.multiData = this.BT;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'chlorophyll_a') {
      this.isMulti = true;
      this.multiData = this.chlorophyll_a;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'salinity') {
      this.isMulti = true;
      this.multiData = this.salinity;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'wind_speed') {
      this.isMulti = true;
      this.multiData = this.wind_speed;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'wind_gust') {
      this.isMulti = true;
      this.multiData = this.wind_gust;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'rainfall') {
      this.isMulti = true;
      this.multiData = this.rainfall;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'temperature') {
      this.isMulti = true;
      this.multiData = this.temperature;
      this.selectedUnit = item.unit;
    } else if (item.param_name === 'current_speed') {
      this.isMulti = true;
      this.multiData = this.current_speed;
      this.selectedUnit = item.unit;
    } else {
      this.isMulti = false;
      this.selectedUnit = item.unit;
    }
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
      .get('http://192.168.0.5:3000/api/getStationConfig')
      .subscribe((data: any) => {
        this.stations = data.map((item: any) => ({
          id: item.id,
          station_id: item.station_id,
          name: item.station_name,
          selectedParameters: [],
          limitReached: false,
        }));
 
        console.log('Stations:', this.stations);
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
      .put('http://192.168.0.5:3000/api/updateHomeConfig', payload)
      .subscribe({
        next: (res) => {
          console.log('Update successful:', res);
          this.getStationConfig(); // refresh UI
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
 
 