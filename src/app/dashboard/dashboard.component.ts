import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
import { fromLonLat } from 'ol/proj';
import { WebsocketService } from '../services/websocket.service';

interface binData{
  value:number;
  name:string;
  direction:string;
}

interface OceansensorsUnit{
  tzc:string;
tm02:string;
wave_direction:string;
mean_wave_direction:string;
max_wave_height:string;
fourier_coefficient_a1:string;
dominant_time_period_fw:string;
havg:string;
current_speed:string;
current_direction:string;
wave_height:string;
wave_heading:string;
tz:string
}

interface MetSensorUnit{
  wind_speed:string;
wind_direction:string;
wind_gust:string;
temperature_deg:string;
rh_percent:string;
bp_hpa:string;
rain_mm:string;
visibility:string;
global_radiation:string;
}


interface WatSensorunit{
  turbidity:string;
conductivity:string;
chlorophyll_a:string;
water_temperature:string;
dissolved_oxygen:string;
phycoerythrin:string;
salinity:string;
fluorescein_dye:string;
ph:string;
}

interface MicroFluSensorUnit{
  oil_in_water:string;
pah:string;
bt:string;
}

@Component({
    selector: 'app-dashboard',
    standalone:true,
    imports: [RadarHomeComponent, HomeV1ChartComponent, HttpClientModule, WindGaugeComponent, BuoyComponent, Gauge2Component, Direction1Component, CommonModule, RotaryDialComponent, DataScoreComponent, Gauge3Component, Direction2Component, BatteryComponent, Gauge1Component, Direction3Component],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy{
  private _sensorsss?: string[];
  @Input()
  set sensorsss(val: string[]) {
    this._sensorsss = val;
  }
  get sensorsss(): string[] {
    if (this._sensorsss && this._sensorsss.length > 0) {
      return this._sensorsss;
    }
    return this.layout?.sensors || [];
  }
  private wsSub?: Subscription;
  private stationSub?: Subscription;

  constructor(
    private map: MapService,
    private http: HttpClient,
    public layout: LayoutComponent,
    private station: StationconfigService,
    private wsService: WebsocketService,
    private globalData: GlobalDataService
  ){}
  direction1:number = 110;
  direction_val:string = '';
  direction2_val:string = '';
  direction2:number = 180;
  direction3:number = 250;
  current_speed_widget!:string;
  current_direction_widget!:string;
  speed1:number = 4;
  speed2:number = 9;
  speed3:number = 15;
  direction!:number;
  direction22!:number;
  direction33!:number ;
  direction4!:number ;
  direction5!:number ;
  direction6!:number ;
  direction7!:number ;
  direction8!:number ;
  direction9!:number;
  direction10!:number ;
  d1_value:string = '';
  d2_value:string = '';
  d3_value:string = '';
  d4_value:string = '';
  d5_value:string = '';
  d6_value:string = '';
  d7_value:string = '';
  d8_value:string = '';
  d9_value:string = '';
  d10_value:string = '';

 oceanSensorUnit!:OceansensorsUnit;
 MetUnit!:MetSensorUnit;
 WaterSensorUnit!:WatSensorunit;
 microUnit!:MicroFluSensorUnit;
 wave_direction_fw_value!:string;
 mean_wave_direction_value!:string;

  showMap:boolean = false;
  BuoyData:BuoyData[] =[];
  sensorConfig:SensorModel[] = [];
  binData:binData[] = [];
  validData:{
    name:string;
    unit:string;
    value:string;
  }[] =  [];
  pairedBins:any[]= [];
  stationConfiglist:StationConfigs[]=[];
  warning:number = 0;
  danger:number = 0;
  buoyLocation:[number, number]= [0,0];
  db_img:string= '';
  ststionID!:string;
toggleMapon(){
  this.map.destroyMap();
  this.stationConfiglist = []
  this.station.getStationNames().subscribe(
    (response:any)=>{
      this.stationConfiglist = response;
      const selectedStation = this.stationConfiglist.filter(item=> item.station_id === this.layout.selectedStationId);
      console.log(selectedStation);
      this.warning = parseFloat(selectedStation[0].warning);
      this.danger = parseFloat(selectedStation[0].danger);
      if(this.warning !==0 && this.danger !==0){
        setTimeout(() => {
    
          this.mapInit()
        }, 100);
      }
    }
  )
  this.showMap = true;

  
}
toggleMapoff(){
  this.map.destroyMap();
  this.showMap = false;
}
listImage:string[]=['../../assets/avatars/live4.jpeg', '../../assets/avatars/live5.png', '../../assets/avatars/live6.jpg', '../../assets/image/Aquadopp_Profiler.jpg']
changeimage(){
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * this.listImage.length);
    this.db_img = this.listImage[1];
  }, 1000);
}
Bins :any[]=[];
fromDate!:string;
toDate!:string;
    ngOnInit(): void {
      this.http.get('http://localhost:3000/api/getBin').subscribe(
        (response:any)=>{
          console.log("binsss", response)
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
      this.ststionID = this.layout?.selectedStationId || this.globalData.getStationId();
      this.map.destroyMap();
        console.log("sensorssss", this.sensorsss)

     this.current_speed_widget= localStorage.getItem('selectedCurrentspeed') ?? '';
     this.current_direction_widget = localStorage.getItem('selectedCurrentdir') ?? '';
      console.log("id_station", this.layout.selectedStationId);
      this.fetchSensorCofig();
      this.fetchSensors();

      this.direction_val = this.directionValue(this.direction1);
      this.direction2_val = this.directionValue(this.direction2);
      this.map.destroyMap();
    
      this.directionAndvalue();

      // Listen for station changes from TopBar
      this.stationSub = this.globalData.stationId$.subscribe((newStationId: string) => {
        if (newStationId && newStationId !== this.ststionID) {
          this.ststionID = newStationId;
          this.layout.selectedStationId = newStationId;
          const snapshot = this.wsService.getLatestSnapshot();
          if (snapshot && snapshot.byStation) {
            const rec = snapshot.byStation[newStationId] ||
                        snapshot.byStation[newStationId.toLowerCase()] ||
                        snapshot.byStation[newStationId.toUpperCase()];
            if (rec) {
              this.updateDashboardWithLiveRecord(rec);
            } else {
              this.fetchSensors();
            }
          } else {
            this.fetchSensors();
          }
        }
      });

      // Real-time WebSocket listener: updates dashboard immediately
      this.wsSub = this.wsService.liveData$.subscribe((payload) => {
        if (!payload || !payload.byStation) return;
        const activeStation = this.layout.selectedStationId || this.ststionID;
        if (!activeStation) return;

        const rec = payload.byStation[activeStation] ||
                    payload.byStation[activeStation.toLowerCase()] ||
                    payload.byStation[activeStation.toUpperCase()];

        if (rec) {
          this.updateDashboardWithLiveRecord(rec);
        }
      });

  this.station.getStationNames().subscribe(
    (response:any)=>{
      this.stationConfiglist = response;
      const selectedStation = this.stationConfiglist.filter(item=> item.station_id === this.layout.selectedStationId);
      if (selectedStation && selectedStation.length > 0) {
        this.warning = parseFloat(selectedStation[0].warning);
        this.danger = parseFloat(selectedStation[0].danger);
        if(this.warning !==0 && this.danger !==0){
          setTimeout(() => {
            this.mapInit()
          }, 100);
        }
      }
    }
  );
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
      

      console.log("Ocean Units:", this.oceanSensorUnit);
      console.log("Meteorology Units:", this.MetUnit);
      console.log("Water Quality Units:", this.WaterSensorUnit);
      console.log("Microflu Units:", this.microUnit);

          this.checkDataLoaded();
        },
        error => console.error('Error fetching sensor config:', error)
      );
    }
    
    fetchSensors() {
      const activeStation = this.layout.selectedStationId || this.ststionID;
      if (!activeStation) return;
      const params = new HttpParams().set('fromDate', this.fromDate).set('toDate', this.toDate).set('stationId', activeStation);
      this.http.get('http://localhost:3000/api/getSensorDataByStationAndDate', { params }).subscribe(
        (response: any) => {
          if (response && response.length > 0) {
            this.updateDashboardWithLiveRecord(response[0]);
          }
        },
        error => console.error('Error fetching sensors:', error)
      );
    }

    updateDashboardWithLiveRecord(bins: any): void {
      if (!bins) return;
      this.BuoyData = [bins];
      this.buoyLocation = [Number(bins.lat), Number(bins.lon)];

      if (bins.wave_heading != null) {
        this.direction2 = Number(bins.wave_heading);
        this.direction2_val = this.directionValue(this.direction2);
      }
      if (bins.wave_direction != null) {
        this.direction1 = Number(bins.wave_direction);
        this.direction_val = this.directionValue(this.direction1);
      }
      if (bins.wave_direction_fw != null) {
        this.wave_direction_fw_value = this.directionValue(Number(bins.wave_direction_fw));
      }
      if (bins.mean_wave_direction != null) {
        this.mean_wave_direction_value = this.directionValue(Number(bins.mean_wave_direction));
      }

      const newPaired: any[] = [];
      for (let b = 1; b <= 10; b++) {
        const speedKey = `current_speed_bin_${b}`;
        const dirKey = `current_direction_bin_${b}`;
        const speedRaw = bins[speedKey];
        const dirRaw = bins[dirKey];
        const speedVal = speedRaw != null ? parseFloat(speedRaw) : 0;
        const dirVal = dirRaw != null ? parseFloat(dirRaw) : 0;
        newPaired.push({
          id: b,
          speed: isNaN(speedVal) ? 0 : speedVal,
          speedLabel: speedKey,
          direction: isNaN(dirVal) ? 0 : dirVal,
          directionLabel: dirKey,
          directionText: this.directionValue(dirVal)
        });
      }

      // Update existing objects in-place so Angular *ngFor doesn't destroy child components
      if (this.pairedBins.length === newPaired.length) {
        for (let i = 0; i < newPaired.length; i++) {
          this.pairedBins[i].speed = newPaired[i].speed;
          this.pairedBins[i].speedLabel = newPaired[i].speedLabel;
          this.pairedBins[i].direction = newPaired[i].direction;
          this.pairedBins[i].directionLabel = newPaired[i].directionLabel;
          this.pairedBins[i].directionText = newPaired[i].directionText;
        }
      } else {
        this.pairedBins = newPaired;
      }

      // Sync individual current directions
      for (let b = 1; b <= 10; b++) {
        const key = `current_direction_bin_${b}`;
        if (bins[key] != null) {
          const val = parseFloat(bins[key]);
          if (b === 1) { this.direction = val; this.d1_value = this.directionValue(val); }
          else if (b === 2) { this.direction22 = val; this.d2_value = this.directionValue(val); }
          else if (b === 3) { this.direction33 = val; this.d3_value = this.directionValue(val); }
          else if (b === 4) { this.direction4 = val; this.d4_value = this.directionValue(val); }
          else if (b === 5) { this.direction5 = val; this.d5_value = this.directionValue(val); }
          else if (b === 6) { this.direction6 = val; this.d6_value = this.directionValue(val); }
          else if (b === 7) { this.direction7 = val; this.d7_value = this.directionValue(val); }
          else if (b === 8) { this.direction8 = val; this.d8_value = this.directionValue(val); }
          else if (b === 9) { this.direction9 = val; this.d9_value = this.directionValue(val); }
          else if (b === 10) { this.direction10 = val; this.d10_value = this.directionValue(val); }
        }
      }

      this.checkDataLoaded();
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
          // console.log("Valid Data:", this.validData);
        };
    
        processChunk();
      }
    }
    
    mapInit(){
      console.log("map init");
      const mapContainer = document.getElementById('ol-map');
      this.map.createMap(
        mapContainer!,
        this.buoyLocation[0],
        this.buoyLocation[1], 
      this.warning, this.danger, 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        
      )
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
      this.direction5 =parseFloat((Math.random() * 360).toFixed(2));
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

    trackByBin(index: number, bin: any): any {
      return bin ? bin.id || bin.speedLabel || index : index;
    }

    ngOnDestroy(): void {
      if (this.wsSub) {
        this.wsSub.unsubscribe();
      }
      if (this.stationSub) {
        this.stationSub.unsubscribe();
      }
      this.map.destroyMap();
    }
}
