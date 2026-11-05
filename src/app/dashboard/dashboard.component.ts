import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';
// import { MapService } from '../map_service/map.service';
import { RadarHomeComponent } from '../radar-home/radar-home.component';
import { HomeV1ChartComponent } from '../home-v1-chart/home-v1-chart.component';
import { BuoyComponent } from '../buoy/buoy.component';
import { Gauge2Component } from '../widgets/gauge2/gauge2.component';
import { WindGaugeComponent } from '../widgets/wind-gauge copy/wind-gauge.component';
import { Direction1Component } from "../widgets/direction1/direction1.component";
import { CommonModule } from '@angular/common';
import { RotaryDialComponent } from "./rotary-dial/rotary-dial.component";
import { DataScoreComponent } from "./data-score/data-score.component";
import { Gauge3Component } from "../widgets/gauge3/gauge3.component";
import { Direction2Component } from "../widgets/direction2/direction2.component";
import { BatteryComponent } from "./battery/battery.component";
import { Gauge1Component } from "../widgets/gauge1/gauge1.component";
import { Direction3Component } from "../widgets/direction3/direction3.component";
import { MapService } from '../settings/station/map.service';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { BuoyData, GlobalDataService } from '../global-data/global-data.component';
import { SensorModel } from '../models/station.model';
import { LayoutComponent } from '../layout/layout.component';
import { ReportService } from '../report/report.service';
import { StationConfigs, StationconfigService } from '../home/homeService/stationconfig.service';
import { response } from 'express';
import { fromLonLat } from 'ol/proj';

interface binData {
  value: number;
  name: string;
  direction: string;
}

interface OceansensorsUnit {
  tzc: string;
  tm02: string;
  wave_direction: string;
  mean_wave_direction: string;
  hmax: string;
  fourier_coefficient_a1: string;
  dominant_time_period_fw: string;
  havg: string;
  current_speed: string;
  current_direction: string;
  wave_height: string;
  wave_heading: string;
  fourier_coefficient_a2: string;
  tz: string;
  pmax?: string;
  average_period_te?: string;
  hm0?: string;
  hm1?: string;
  tmean?: string;
  epslion?: string;
  epsilon?: string;
  h3_eps?: string;
  h2?: string;
  t2?: string;
  h3?: string;
  t3?: string;
  h10?: string;
  t10?: string;
  hmax_zc?: string;
  rms_tilt?: string;
}

interface MetSensorUnit {
  wind_speed: string;
  wind_direction: string;
  wind_gust: string;
  temperature_deg: string;
  rh_percent: string;
  bp_hpa: string;
  rain_mm: string;
  visibility: string;
  global_radiation: string;
}


interface WatSensorunit {
  turbidity: string;
  conductivity: string;
  chlorophyll_a: string;
  water_temperature: string;
  dissolved_oxygen: string;
  phycoerythrin: string;
  salinity: string;
  fluorescein_dye: string;
  ph: string;
}

interface MicroFluSensorUnit {
  oil_in_water: string;
  pah: string;
  bt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RadarHomeComponent, HomeV1ChartComponent, HttpClientModule, WindGaugeComponent, BuoyComponent, Gauge2Component, Direction1Component, CommonModule, RotaryDialComponent, DataScoreComponent, Gauge3Component, Direction2Component, BatteryComponent, Gauge1Component, Direction3Component],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @Input() sensorsss!: string[];
  private wsSub?: Subscription;

  constructor(
    private map: MapService,
    private http: HttpClient,
    public layout: LayoutComponent,
    private station: StationconfigService,
    private wsService: WebsocketService,
    private globalData: GlobalDataService
  ) { }
  direction1: number = 110;
  direction_val: string = '';
  direction2_val: string = '';
  direction2: number = 180;
  direction3: number = 250;
  current_speed_widget!: string;
  current_direction_widget!: string;
  speed1: number = 4;
  speed2: number = 9;
  speed3: number = 15;
  direction!: number;
  direction22!: number;
  direction33!: number;
  direction4!: number;
  direction5!: number;
  direction6!: number;
  direction7!: number;
  direction8!: number;
  direction9!: number;
  direction10!: number;
  d1_value: string = '';
  d2_value: string = '';
  d3_value: string = '';
  d4_value: string = '';
  d5_value: string = '';
  d6_value: string = '';
  d7_value: string = '';
  d8_value: string = '';
  d9_value: string = '';
  d10_value: string = '';

  oceanSensorUnit!: OceansensorsUnit;
  MetUnit!: MetSensorUnit;
  WaterSensorUnit!: WatSensorunit;
  microUnit!: MicroFluSensorUnit;
  wave_direction_fw_value!: string;
  mean_wave_direction_value!: string;

  showMap: boolean = false;
  BuoyData: BuoyData[] = [];
  sensorConfig: SensorModel[] = [];
  binData: binData[] = [];
  validData: {
    name: string;
    unit: string;
    value: string;
  }[] = [];
  pairedBins: any[] = [];
  stationConfiglist: StationConfigs[] = [];
  warning: number = 0;
  danger: number = 0;
  buoyLocation: [number, number] = [0, 0];
  db_img: string = '';
  ststionID!: string;
  StationName!: string;
  toggleMapon() {
    this.map.destroyMap();
    this.stationConfiglist = []
    this.station.getStationNames().subscribe(
      (response: any) => {
        this.stationConfiglist = response;
        const selectedStation = this.stationConfiglist.filter(item => item.station_id === this.layout.selectedStationId);
        //console.log(selectedStation);
        this.warning = parseFloat(selectedStation[0].warning);
        this.danger = parseFloat(selectedStation[0].danger);
        if (this.warning !== 0 && this.danger !== 0) {
          setTimeout(() => {

            this.mapInit()
          }, 100);
        }
      }
    )
    this.showMap = true;


  }
  toggleMapoff() {
    this.map.destroyMap();
    this.showMap = false;
    this.measureMode = false;
  }
  listImage: string[] = ['../../assets/avatars/live4.jpeg', '../../assets/avatars/live5.png', '../../assets/avatars/live6.jpg', '../../assets/image/Aquadopp_Profiler.jpg']
  changeimage() {
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.listImage.length);
      this.db_img = this.listImage[randomIndex];
    }, 1000);
  }
  Bins: any[] = [];
  fromDate!: string;
  toDate!: string;
  ngOnInit(): void {
    this.map.destroyMap();
    this.http.get('http://localhost:3000/api/getBin').subscribe(
      (response: any) => {
        //console.log("binsss", response)
        this.Bins = response
      }
    )
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 0, 0);

    this.fromDate = startDate.toISOString();
    this.toDate = endDate.toISOString();
    this.changeimage();
    this.ststionID = this.layout.selectedStationId;
    this.StationName = this.layout.StationName;
    this.map.destroyMap();

    this.current_speed_widget = localStorage.getItem('selectedCurrentspeed') ?? '';
    this.current_direction_widget = localStorage.getItem('selectedCurrentdir') ?? '';
    this.fetchSensorCofig();
    this.fetchSensors();

    this.direction_val = this.directionValue(this.direction1);
    this.direction2_val = this.directionValue(this.direction2);
    this.map.destroyMap();

    this.directionAndvalue();

    this.station.getStationNames().subscribe(
      (response: any) => {
        this.stationConfiglist = response;
        const selectedStation = this.stationConfiglist.filter(item => item.station_id === this.layout.selectedStationId);
        if (selectedStation && selectedStation.length > 0) {
          this.warning = parseFloat(selectedStation[0].warning) || 0;
          this.danger = parseFloat(selectedStation[0].danger) || 0;
          if (this.warning !== 0 && this.danger !== 0) {
            setTimeout(() => {
              this.mapInit();
            }, 100);
          }
        }
      }
    );

    // Listen for live sensor updates from WebSocket server
    this.wsSub = this.wsService.liveData$.subscribe((payload) => {
      if (!payload) return;
      const currentStationId = this.layout.selectedStationId || this.ststionID;
      if (!currentStationId) return;

      let stationRecord = null;
      if (payload.byStation) {
        const sid = currentStationId.trim();
        stationRecord = payload.byStation[sid] ||
          payload.byStation[sid.toUpperCase()] ||
          payload.byStation[sid.toLowerCase()];
      }
      if (!stationRecord && payload.data && Array.isArray(payload.data)) {
        stationRecord = payload.data.find((item: any) =>
          item.station_id?.toString().toUpperCase() === currentStationId.toString().toUpperCase()
        );
      }

      if (stationRecord) {
        this.updateDashboardWithLiveRecord(stationRecord);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }


  fetchSensorCofig() {
    this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
      (response: any) => {
        this.sensorConfig = response;

        console.log("Sensor==", response);
        this.oceanSensorUnit = {} as OceansensorsUnit;
        this.MetUnit = {} as MetSensorUnit;
        this.WaterSensorUnit = {} as WatSensorunit;
        this.microUnit = {} as MicroFluSensorUnit;

        // Loop through the response to populate units
        response.forEach((item: any) => {
          switch (item.name) {
            case 'oceanography':
              this.oceanSensorUnit[item.param_name as keyof OceansensorsUnit] = item.unit;
              break;

            case 'meteorology':
              this.MetUnit[item.param_name as keyof MetSensorUnit] = item.unit;
              break;

            case 'water_quality':
              this.WaterSensorUnit[item.param_name as keyof WatSensorunit] = item.unit;
              break;

            case 'microflu':
              this.microUnit[item.param_name as keyof MicroFluSensorUnit] = item.unit;
              break;
          }
        });


        //console.log("Ocean Units:", this.oceanSensorUnit);
        //console.log("Meteorology Units:", this.MetUnit);
        //console.log("Water Quality Units:", this.WaterSensorUnit);
        //console.log("Microflu Units:", this.microUnit);

        this.checkDataLoaded();
      },
      error => console.error('Error fetching sensor config:', error)
    );
  }

  detectRedTide(data: BuoyData): boolean {
    return (
      data.chlorophyll_a > 10 &&
      data.dissolved_oxygen < 4 &&
      data.turbidity > 10 &&
      data.water_temperature >= 22 && data.water_temperature <= 32 &&
      data.salinity >= 25 && data.salinity <= 36 &&
      (data.ph > 8.5 || data.ph < 7.5)
    );
  }
  redTideRiskScore(data: BuoyData): string {
    let score = 0;

    if (data.chlorophyll_a > 10) score += 3;
    if (data.dissolved_oxygen < 4) score += 2;
    if (data.turbidity > 10) score += 2;
    if (data.water_temperature >= 22 && data.water_temperature <= 32) score += 1;
    if (data.salinity >= 25 && data.salinity <= 36) score += 1;
    if (data.ph > 8.5 || data.ph < 7.5) score += 1;

    if (score >= 7) {
      return 'High Risk';
    } else if (score >= 4) {
      return 'Moderate Risk';
    } else {
      return 'Low Risk';
    }
  }
  IsRedTide!: boolean;
  risk!: string;

  fetchSensors() {
    this.BuoyData = [];
    const params = new HttpParams().set('fromDate', this.fromDate).set('toDate', this.toDate).set('stationId', this.layout.selectedStationId);
    this.http.get('http://localhost:3000/api/getSensorDataByStationAndDate', { params }).subscribe(
      (response: any) => {
        this.BuoyData = response;
        this.checkDataLoaded();
        if (this.BuoyData && this.BuoyData.length > 0) {
          this.updateDashboardWithLiveRecord(this.BuoyData[0]);
          // Set the last received timestamp for display in top-bar
          if (this.BuoyData[0].timestamp) {
            this.globalData.setLastReceivedTimestamp(this.BuoyData[0].timestamp);
          }
        }
      },
      error => console.error('Error fetching sensors:', error)
    );
  }

  updateDashboardWithLiveRecord(record: any) {
    if (!record) return;

    if (!this.BuoyData || this.BuoyData.length === 0) {
      this.BuoyData = [record];
    } else {
      this.BuoyData[0] = { ...this.BuoyData[0], ...record };
    }

    // Update the last received timestamp for the top-bar indicator
    const ts = record.timestamp || record.datetime;
    if (ts) {
      this.globalData.setLastReceivedTimestamp(ts);
    }

    const currentRecord = this.BuoyData[0];
    this.IsRedTide = this.detectRedTide(currentRecord);
    this.risk = this.redTideRiskScore(currentRecord);

    if (currentRecord.lat && currentRecord.lon) {
      this.buoyLocation = [currentRecord.lat, currentRecord.lon];
    }

    this.wave_direction_fw_value = this.directionValue(currentRecord.wave_direction_fw);
    this.mean_wave_direction_value = this.directionValue(currentRecord.mean_wave_direction);

    const currentData = Object.keys(currentRecord)
      .filter(key =>
        key.toLowerCase().includes('current_speed') || key.toLowerCase().includes('current_direction')
      )
      .map(key => ({
        name: key,
        value: (currentRecord as any)[key]
      }));

    this.binData = [];
    for (let index = 0; index < currentData.length; index++) {
      this.binData.push({
        name: currentData[index].name,
        value: currentData[index].value,
        direction: this.directionValue(parseFloat(currentData[index].value) || 0)
      });
    }

    for (let i = 0; i < this.binData.length; i += 2) {
      const speedBin = this.binData[i];
      const directionBin = this.binData[i + 1];
      const pairIdx = i / 2;

      if (this.pairedBins[pairIdx]) {
        this.pairedBins[pairIdx].speed = speedBin ? speedBin.value : 0;
        this.pairedBins[pairIdx].speedLabel = speedBin ? speedBin.name : '';
        this.pairedBins[pairIdx].direction = directionBin ? directionBin.value : 0;
        this.pairedBins[pairIdx].directionLabel = directionBin ? directionBin.name : '';
        this.pairedBins[pairIdx].directionText = directionBin ? directionBin.direction : '';
      } else {
        this.pairedBins.push({
          id: pairIdx,
          speed: speedBin ? speedBin.value : 0,
          speedLabel: speedBin ? speedBin.name : '',
          direction: directionBin ? directionBin.value : 0,
          directionLabel: directionBin ? directionBin.name : '',
          directionText: directionBin ? directionBin.direction : ''
        });
      }
    }
  }

  trackByBin(index: number, bin: any): any {
    return bin?.id ?? index;
  }




  checkDataLoaded() {
    if (this.BuoyData.length && this.sensorConfig.length) {
      this.processValidData(); // Proceed only when both are available
    }
  }


  processValidData() {
    if (this.BuoyData.length && this.sensorConfig.length) {
      const firstEntry = this.BuoyData[0]; // get the first record
      this.validData = [];
      let chunk = 0;

      const processChunk = () => {
        const keys = Object.keys(firstEntry);
        if (chunk < keys.length) {
          const key = keys[chunk];
          if (key !== 'id' && key !== 'station_id' && key !== 'timestamp' && key !== 'datetime') {
            const configItem = this.sensorConfig.find(c => c.name === key);
            if (configItem) {
              this.validData.push({
                name: key,
                unit: configItem.unit || '',
                value: 'firstEntry[key]'
              });
            }
          }
          chunk++;
          setTimeout(processChunk, 0); // Allow the browser to process UI events
        }
        // //console.log("Valid Data:", this.validData);
      };

      processChunk();
    }
  }

  mapInit() {
    //console.log("map init");
    const mapContainer = document.getElementById('ol-map');
    this.map.createMap(
      mapContainer!,
      this.buoyLocation[0],
      this.buoyLocation[1],
      this.warning, this.danger, 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', this.StationName
    )
  }
  measureMode: boolean = false;
  onEnableMeasurement() {
    this.measureMode = !this.measureMode
    this.map.enableMeasurementTool();
  }

  dropdownOpen = false;
  selectedText = 'Please Select Station';
  selectedImage: string | null = null;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(value: string, image: string, text: string) {
    this.selectedText = text;
    this.selectedImage = image || null;
    this.dropdownOpen = false;
  }


  directionAndvalue() {
    this.direction = parseFloat((Math.random() * 360).toFixed(2));
    this.direction22 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction33 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction4 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction5 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction6 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction7 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction8 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction9 = parseFloat((Math.random() * 360).toFixed(2));
    this.direction10 = parseFloat((Math.random() * 360).toFixed(2));

    // this.direction = 60;
    // this.direction22 = 0;
    // this.direction33 = 0;
    // this.direction4 = 0;
    // this.direction5 = 0;
    // this.direction6 = 0;
    // this.direction7 = 0;
    // this.direction8 = 0;
    // this.direction9 = 0;
    // this.direction10 = 0;


    this.d1_value = this.directionValue(this.direction);
    this.d2_value = this.directionValue(this.direction22);
    this.d3_value = this.directionValue(this.direction33);
    this.d4_value = this.directionValue(this.direction4);
    this.d5_value = this.directionValue(this.direction5);
    this.d6_value = this.directionValue(this.direction6);
    this.d7_value = this.directionValue(this.direction7);
    this.d8_value = this.directionValue(this.direction8);
    this.d9_value = this.directionValue(this.direction9);
    this.d10_value = this.directionValue(this.direction10);

    // console.log('Directions and Corresponding Values:');
    // console.log(`D1: ${this.direction.toFixed(2)} -> ${this.d1_value}`);
    // console.log(`D2: ${this.direction22.toFixed(2)} -> ${this.d2_value}`);
    // console.log(`D3: ${this.direction33.toFixed(2)} -> ${this.d3_value}`);
    // console.log(`D4: ${this.direction4.toFixed(2)} -> ${this.d4_value}`);
    // console.log(`D5: ${this.direction5.toFixed(2)} -> ${this.d5_value}`);
    // console.log(`D6: ${this.direction6.toFixed(2)} -> ${this.d6_value}`);
    // console.log(`D7: ${this.direction7.toFixed(2)} -> ${this.d7_value}`);
    // console.log(`D8: ${this.direction8.toFixed(2)} -> ${this.d8_value}`);
    // console.log(`D9: ${this.direction9.toFixed(2)} -> ${this.d9_value}`);
    // console.log(`D10: ${this.direction10.toFixed(2)} -> ${this.d10_value}`);
  }

  parseFoloaT(val: string): number {
    return parseFloat(val);
  }
  directionValue(degrees: number): string {
    degrees = degrees % 360;
    if (degrees < 0) degrees += 360;
    if (degrees >= 348.75 || degrees < 11.25) {
      return 'N';   // North
    } else if (degrees >= 11.25 && degrees < 33.75) {
      return 'NNE'; // North-Northeast
    } else if (degrees >= 33.75 && degrees < 56.25) {
      return 'NE';  // Northeast
    } else if (degrees >= 56.25 && degrees < 78.75) {
      return 'ENE'; // East-Northeast
    } else if (degrees >= 78.75 && degrees < 101.25) {
      return 'E';   // East
    } else if (degrees >= 101.25 && degrees < 123.75) {
      return 'ESE'; // East-Southeast
    } else if (degrees >= 123.75 && degrees < 146.25) {
      return 'SE';  // Southeast
    } else if (degrees >= 146.25 && degrees < 168.75) {
      return 'SSE'; // South-Southeast
    } else if (degrees >= 168.75 && degrees < 191.25) {
      return 'S';   // South
    } else if (degrees >= 191.25 && degrees < 213.75) {
      return 'SSW'; // South-Southwest
    } else if (degrees >= 213.75 && degrees < 236.25) {
      return 'SW';  // Southwest
    } else if (degrees >= 236.25 && degrees < 258.75) {
      return 'WSW'; // West-Southwest
    } else if (degrees >= 258.75 && degrees < 281.25) {
      return 'W';   // West
    } else if (degrees >= 281.25 && degrees < 303.75) {
      return 'WNW'; // West-Northwest
    } else if (degrees >= 303.75 && degrees < 326.25) {
      return 'NW';  // Northwest
    } else {
      return 'NNW'; // North-Northwest
    }
  }
}
