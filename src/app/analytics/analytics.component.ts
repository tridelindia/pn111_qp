import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TestChartComponent } from "./test-chart/test-chart.component";
import { Chart2Component } from "./chart2/chart2.component";
import { WindChartComponent } from "./wind-chart/wind-chart.component";
import { ScatterComponent } from "./scatter/scatter.component";
import { parameter } from 'three/webgpu';
import { BuoyData, GlobalDataService } from '../global-data/global-data.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { MultiAxisComponent } from "../analisys/home/multi-axis/multi-axis.component";
import { SingleAxisComponent } from "../analisys/home/single-axis/single-axis.component";
import { ScatterAxisComponent } from "../analisys/home/scatter-axis/scatter-axis.component";
import { RosePlotComponent } from "../analisys/home/rose-plot/rose-plot.component";
import { DirectionChartComponent } from "./direction-chart/direction-chart.component";
import { ReportService } from '../report/report.service';
import { forkJoin } from 'rxjs';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastrService } from 'ngx-toastr';
import { ToastModule } from 'primeng/toast';
import { LayoutComponent } from '../layout/layout.component';

interface param{
  param_name:string;
  name:string;
}
interface scatData{
  xDate: string; yDate: string; direction: number
}
interface Station{
  stationId: string; name: string;
}
export interface singleAxis{
  name:string;
  value: string;
  DateTime:string
}
export interface MultiAxis {
  name1: string;
  name2:string;
  value1: string;
  value2: string;
  timestamps: string;
}
export interface ScatterAxis{
  name1: string;
  name2:string;
  value1: string;
  value2: string;
}
export interface PolarAxis {
  name:string;
  speed:string;
  direction:string;

}

@Component({
  selector: 'app-analytics',
  standalone:true,
  imports: [CommonModule, HttpClientModule,DatePickerModule,ToastModule, FormsModule, ScrollingModule, TestChartComponent, Chart2Component, WindChartComponent, ScatterComponent, MultiSelectModule, FormsModule, MultiAxisComponent, SingleAxisComponent, ScatterAxisComponent, RosePlotComponent, FormsModule, DirectionChartComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit{
  selectedSensor:string = 'oceanography';
  listparams:param[] = [];
  stations:Station[] = [];
  selectedStation!:string[];
  filteredparams:param[]=[];
  selectedParams:param[]=[];
  isSingleView:boolean = true;
  numberr:number = 4;
  isSelectParams:boolean = false;
  selectedPlot:string = 'line';
  scatData:scatData[] = []
  Buoy:BuoyData[]=[];

  isLoad:boolean = false;

  isPolar:boolean = false;
  items = Array.from({ length: 1000 }, (_, i) => `Item #${i}`);
  selectedMultiStationParam!:string;

  isCurrent:boolean= false;
  selectedBin!:string;
  Bins:any[] = [];

  singleStation!:string;
  parametres:string[]=[];
  sensorData: any[] = [];
  buoyData:any[]=[];
  isSingleLoad:boolean = false;
  isMultiLoading: boolean = true;
  isScatterLoading: boolean = false;
  isPolarLoading: boolean = false;
  isSingledirection:boolean = true;

  selectedparam!:string;
  selectedMultix1!:string;
  selectedMultix2!:string;

  selectedScactterX!:string;
  selectedScatterY!:string;
  singleAxis:singleAxis[]=[]
  multiAxis:MultiAxis[] = []
  scatterAxis:ScatterAxis[] = [];
  PolarAxis:PolarAxis[] = [];
  PolarAxis2:PolarAxis[]=[];
  selectedDate!:string;
multiStationData!:{
  param_name: string,
  values: { [key: string]: string[] },
  datetime: string[]
};
pickerState:string = 'date';


  onPickerTap(state:string){
    this.pickerState = state
  }

  changetiMultiStationView() {
    this.isLoad = true;
  console.log("selected Param value for station", )
    const selectedParam =  this.selectedMultiStationParam.toLowerCase(); // e.g., "wave_heading"
  
    const requests = this.selectedStation.map(stationId =>
      this.reportService.getAllstationData(stationId, '2025-01-01T00:00:00.000Z', '2025-01-14T23:59:00.000Z')
    );
  
    forkJoin(requests).subscribe(
      (responses: any[]) => {
        const result: {
          param_name: string,
          values: { [key: string]: string[] },
          datetime: string[]
        } = {
          param_name: selectedParam,
          values: {},
          datetime: []
        };
  
        responses.forEach((stationData: any[], index: number) => {
          const vKey = `v${index + 1}`; 
  
          result.values[vKey] = stationData.map(entry => entry[selectedParam] ?? null);
  
          if (index === 0) {
            result.datetime = stationData.map(entry => entry.datetime);
          }
        });
        this.multiStationData = result;
        console.log('Final Structured Data:', result);
        this.isLoad = false;
      },
      error => {
        console.error('Error fetching station data:', error);
        this.isLoad = false;
      }
    );
  }
  count:number = 0
isSubmitButton(){
      this.polarNumber = 0;
    this.isCurrentPolar = false;
    this.isPolarLoading = true;
    this.isLoadingCurrentPolar = true;
  this.isTest();
  setTimeout(() => {
    this.isTest();
  }, 150);
}
  isTest(){
setTimeout(() => {
  
  this.isLoad = true;
  console.log("selected Stations", this.selectedStation)
  this.changetiMultiStationView();
  if(this.isSingleView){
    this.fetchSensorData()
    // this.onPlotSelect(event, this.selectedPlot)
  }

  // if(this.count !== 0){
  //   setTimeout(() => {
  //     this.numberr = this.selectedParams.length;
  //     console.log(this.numberr)
  //     const stringList: string[] = [];
  //     for (let index = 0; index < this.selectedParams.length; index++) {
  //       stringList.push(
  //         this.selectedParams[index].param_name
  //       )
  //     } 
      
  //     const word1 = "_direction";
  //     const word2 = "_height";
      
  //     // Find if any string contains either of the two words
  //     const matchedStrings = stringList.filter(str =>
  //       str.toLowerCase().includes(word1.toLowerCase()) ||
  //       str.toLowerCase().includes(word2.toLowerCase())
  //     );
  //     const matchFound = stringList.some(str =>
  //       str.toLowerCase().includes(word1.toLowerCase()) ||
  //       str.toLowerCase().includes(word2.toLowerCase())
  //     );
      
  //     console.log("match",matchedStrings);
  //     if(matchFound){
  //       console.log(matchedStrings.length);
  //       this.selectedParams = [];
  //       for(let i=0; i<matchedStrings.length; i++){

  //         const filter = this.listparams.filter(item=> item.param_name === matchedStrings[i])
  //         this.selectedParams.push(
  //           filter[i]
  //         )
  //         // this.selectedParams = this.listparams.filter(item=> item.param_name === matchedStrings[1])
  //       }
  //       this.numberr = 2;
  //       this.isPolar = true;
        
  //     }else{
        
  //       this.isPolar = false;
  //     }
  //     this.isLoad = false;
   
  //     }, 100);
  // // }
  

  //   const startDate= new Date(this.selectedDate[0]);
  //   startDate.setHours(0,0,0,0);

  //   const endDate = new Date(this.selectedDate[1]);
  //   endDate.setHours(23,59,0,0);
  //   // console.log("date", this.selectedDate, startDate.toLocaleString(), endDate.toISOString())
  //   this.count = this.count +1;
  //   this.singleStation = this.singleStation
}, 100);
  }

  isViewChange(value:string){
    // console.log("testing",this.isLoad, this.isPolar)
    if(value == 'single'){
      this.selectedMultiStationParam = this.filteredparams[0].param_name
      this.isSingleView = true;
    }else{
      this.isSingleView = false;
      this.selectedMultiStationParam = this.filteredparams[0].param_name
      this.changetiMultiStationView()
    }
  }
  fromDate!: string;
toDate!: string;

onDatePicked() {
  if (!this.selectedDate) return;

  if (this.pickerState === 'date' && Array.isArray(this.selectedDate)) {
    // For date range
    const startDate = new Date(this.selectedDate[0]);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.selectedDate[1]);
    endDate.setHours(23, 59, 0, 0);

    this.fromDate = startDate.toISOString();
    this.toDate = endDate.toISOString();
  }

  else if (this.pickerState === 'week') {
    const selected = new Date(this.selectedDate);
    const dayOfWeek = selected.getDay(); // Sunday = 0
    const start = new Date(selected);
    start.setDate(selected.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 0, 0);

    this.fromDate = start.toISOString();
    this.toDate = end.toISOString();
  }

  else if (this.pickerState === 'month') {
    const selected = new Date(this.selectedDate);
    const start = new Date(selected.getFullYear(), selected.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(selected.getFullYear(), selected.getMonth() + 1, 0, 23, 59, 0, 0);

    this.fromDate = start.toISOString();
    this.toDate = end.toISOString();
  }

  else if (this.pickerState === 'year') {
    const selected = new Date(this.selectedDate);
    const start = new Date(selected.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(selected.getFullYear(), 11, 31, 23, 59, 0, 0);

    this.fromDate = start.toISOString();
    this.toDate = end.toISOString();
  }

    // console.log("date", this.selectedDate)
    // console.log("date1",new Date(this.selectedDate[0]))
    console.log("week", this.fromDate, this.toDate);
    const date = new Date(this.selectedDate[0]);
    const date2 = new Date(this.selectedDate[1]); 

    console.log("date", date.toISOString(), date2.toISOString())
  }
  getFullWeek(selected: Date): Date[] {
  const selectedDate = new Date(selected);
  const dayOfWeek = selectedDate.getDay(); // 0 (Sun) to 6 (Sat)
  
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - dayOfWeek); // Go to Sunday

  const fullWeek: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    fullWeek.push(day);
  }

  return fullWeek;
}

getWeekBounds(selected: Date): { sunday: string, saturday: string } {
  const selectedDate = new Date(selected);
  const dayOfWeek = selectedDate.getDay(); // 0 (Sun) to 6 (Sat)

  const sundayy = new Date(selectedDate);
  sundayy.setDate(selectedDate.getDate() - dayOfWeek);

  const saturdayy= new Date(sundayy);
  saturdayy.setDate(sundayy.getDate() + 6);
  const saturday = saturdayy.toISOString();
  const sunday = sundayy.toISOString();

  return { sunday, saturday };
}

  onParamChange(event: Event, item: param) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (this.selectedParams.length < 4) {
        this.selectedParams.push(item);
      }
    } else {
      this.selectedParams = this.selectedParams.filter(p => p !== item);
    }
  }
  
  isChecked(item: param): boolean {
    return this.selectedParams.includes(item);
  
}
removeSelected(item: param) {
  this.selectedParams = this.selectedParams.filter(p => p !== item);
}
  onParamSelection(value:string){
    
    if(value ==='tap'){

      this.isSelectParams = true;
    }else if(value === 'back'){
this.isSelectParams = false;
    }
  }
  onSelectSensor(name:string){
    this.selectedSensor = name;
    this.isPolar = false;
    this.polarNumber = 0;
    this.isCurrentPolar = false;
    this.isPolarLoading = true;
    this.isLoadingCurrentPolar = true;
     

    console.log("selected sensor", this.selectedSensor);
    this.selectedParams = [];
    console.log(this.listparams);
    if(name === 'oceanography'){
      this.filteredparams = this.listparams.filter(item => item.name === 'oceanography');
    }else if(name === 'meteriology'){
      this.filteredparams = this.listparams.filter(item => item.name === 'meteorology');
    }else if(name === 'waterQuality'){
      this.filteredparams = this.listparams.filter(item => item.name === 'water_quality');
    }else if(name === 'microFlu'){
      this.filteredparams = this.listparams.filter(item => item.name === 'microflu');
    }else if(name === 'adcp'){
      this.filteredparams = this.listparams.filter(item =>
        item.name === 'oceanography' &&
        (item.param_name === 'current_speed' || item.param_name === 'current_direction')
      );
    }
    console.log("filterrd===", this.filteredparams)
    this.fetchSensor()
    this.onAssignDataForPolar()
    if(this.plotType === 'polar'){
      this.filteredparams = this.filteredparams.filter(item=> item.param_name.includes('direction') || item.param_name.includes('speed')||item.param_name.includes('height'))
    }
  }

isMeteriology:boolean=true;
  ngOnInit(): void {
    this.http.get('http://localhost:3000/api/getBin').subscribe(
        (response:any)=>{
          console.log("binsss", response)
         this.Bins = response
        }
      )
    this.isMeteriology = this.layout.sensors.includes('meteorology');
    this.polarNumber = 0;
    this.isCurrentPolar = false;
    this.isPolarLoading = true;
    this.isLoadingCurrentPolar = true;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 0, 0);

    this.fromDate = startDate.toISOString();
    this.toDate = endDate.toISOString();
    
     this.http.get('http://localhost:3000/api/getStationConfig').subscribe(
            (response: any) => {
                // console.log(response);
                for (let index = 0; index < response.length; index++) {
                    this.stations.push({
                      stationId: response[index].station_id,
                      name:response[index].station_name})
                }
                // this.selectedStation = this.stations;
                
                this.singleStation = this.stations[0].name;
                // console.log("==============================================")
                // console.log("single station is", this.stations[0].name, this.singleStation)

                // console.log("selected station param====", this.selectedMultiStationParam)
                // console.log("==============================================")
                this.selectedStation = [this.stations[0].stationId]
                    // console.log("station",this.stations, this.selectedStation);
                    this.fetchSensors()
                },
                (error: any) => {
                    console.log(error);
                  }
        )
  }

  constructor(
    private http:HttpClient,
    private data:GlobalDataService,
    private reportService:ReportService,
    private toast:ToastrService,
    private layout:LayoutComponent
  ){}


  onPlotSelect(event:Event, val?:string){
    this.isLoad = true;
    this.isSingleLoad = true;
    this.isMultiLoading = true;
    setTimeout(() => {
      let selectedValue:string;
      if(val){
        selectedValue = val
      }else{
       selectedValue = (event.target as HTMLSelectElement).value;
      }
      
    // console.log(selectedValue);
    this.selectedPlot = selectedValue;
    this.isLoad = false;
    this.isSingleLoad = false;
    this.isMultiLoading = false
    }, 100);
  }

singleStationchange(){
  const selectedStationn = this.stations.filter(item=> item.name == this.singleStation);
  console.log("changes station", selectedStationn);
  this.selectedStation.push(selectedStationn[0].stationId);

}
  fetchSensorData(){
    const id = this.stations.filter(item=> item.name === this.singleStation)
    
    console.log("station id issss", id);
    if (!this.selectedDate) {
      this.toast.warning("please select date range")
    }else{
      this.fetchSensors()
//  const toDate = '2025-04-01T23:59:00.000Z'
//     const fromDate = '2025-04-01T00:00:42.000Z'
//     const dates = {
//       fromDate: fromDate,
//       toDate: toDate
//     }
//     //console.log("selected Station ID===",  this.stations[0].stationId )
//    const params = new HttpParams()
//     .set('fromDate',fromDate)
//     .set('toDate',toDate)
//     .set('station_id', id[0].stationId);
//     console.log("params", params);
//     this.http.get('http://localhost:3000/api/getSensorDataByDate', {params} ).subscribe(
//       (response: any) => {
//         this.Buoy = response;
//         //console.log("buoy",this.Buoy, this.filteredparams);
//         this.buoyData = response
//         if (this.buoyData.length < 0) {
//           this.selectedparam = this.filteredparams[0].param_name
//           this.selectedScactterX =  this.filteredparams[1].param_name;
//           this.selectedScatterY =  this.filteredparams[2].param_name;
//           this.selectedMultix1 =  this.filteredparams[1].param_name;
//           this.selectedMultix2 =  this.filteredparams[2].param_name;
//           //console.log("==============================================")
//           this.selectedMultiStationParam = this.filteredparams[0].param_name
//           //console.log("selected station param====",this.filteredparams, this.selectedMultiStationParam)
//           //console.log("==============================================")
//         this.isSingleLoad = true;
//           this.isScatterLoading = true;
//           this.isMultiLoading = true;
//           setTimeout(() => {
//             this.assignSingleAxis(this.selectedparam);
//             this.assignScatterAxis(this.selectedScactterX, this.selectedScatterY)
//             this.assignMultiAxis(this.selectedMultix1, this.selectedMultix2);

//           }, 100);  
//           this.fetchData()
//         }
//         },
//         (error: any) => {
//           console.log(error);
//           }
//     )
    }
   
  }

  fetchSensors(){
    this.listparams = [];
    this.isPolarLoading = true;
    this.filteredparams = [];
    this.selectedParams = [];
this.selectedparam = '';
this.selectedScactterX = '';
this.selectedScatterY = '';
this.selectedMultix1 = '';
this.selectedMultix2 = '';
this.selectedMultiStationParam = '';

    this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
      (response:any) => {
        //console.log(response);
          this.listparams = response;
          this.data.SensorConfigs = response
          //console.log("params",this.listparams.length)
          this.filteredparams = this.listparams.filter(item => item.name === 'oceanography');
          setTimeout(() => {
            this.selectedParams.push(
              {
                name : this.filteredparams[0].name,
                param_name:this.filteredparams[0].param_name
              }
            )            
          }, 100)
          this.selectedparam = this.filteredparams[0].param_name
          this.selectedScactterX =  this.filteredparams[1].param_name;
          this.selectedScatterY =  this.filteredparams[2].param_name;
          this.selectedMultix1 =  this.filteredparams[1].param_name;
          this.selectedMultix2 =  this.filteredparams[2].param_name;
          this.selectedMultiStationParam = this.filteredparams[0].param_name
          this.isSingleLoad = true;
          this.isScatterLoading = true;
          this.isMultiLoading = true;
          this.fetchData();
          // if(this.buoyData.length > 0){

            //console.log("step 1 reached")
          // }
        
          //console.log("paramets:", this.parametres)
            
            
            // this.isTest();
            this.isLoad= true;
            setTimeout(() => {
              this.numberr = this.selectedParams.length;
              console.log(this.numberr)
              const stringList: string[] = [];
              for (let index = 0; index < this.filteredparams.length; index++) {
                stringList.push(
                  this.filteredparams[index].param_name
                )
              } 
              
              const word1 = "_direction";
              const word2 = "_height";
              const word3 = "_speed";
              const excludedParam = "mean_wave_direction";

              
              // Find if any string contains either of the two words
              const matchedStrings = stringList.filter(str =>
                str.toLowerCase().includes(word1.toLowerCase()) ||
                str.toLowerCase().includes(word2.toLowerCase()) ||
                str.toLowerCase().includes(word3.toLowerCase()) && str !== excludedParam
              );
              const matchFound = stringList.some(str =>
                str.toLowerCase().includes(word1.toLowerCase()) ||
                str.toLowerCase().includes(word2.toLowerCase()) ||
                str.toLowerCase().includes(word3.toLowerCase())
              );
              
              console.log("match",matchedStrings);
              if(matchFound && matchedStrings.length > 2){
                console.log(matchedStrings.length);
                // this.selectedParams = [];
                // for(let i=0; i<matchedStrings.length; i++){
      
                //   const filter = this.listparams.filter(item=> item.param_name === matchedStrings[i])
                //   this.selectedParams.push(
                //     filter[i]
                //   )
                //   // this.selectedParams = this.listparams.filter(item=> item.param_name === matchedStrings[1])
                // }
                // this.numberr = 2;
                this.isCurrentPolar = true;
                this.polarNumber = 2
                const val = matchedStrings[0];
                const val2 = matchedStrings[1];
                
                // const bin = this.changewithBinPolar()
                console.log("polarrr",matchedStrings)
                setTimeout(() => {
                  this.isPolar = true;
                  const val3 = matchedStrings[3].includes('current_speed')?matchedStrings[3]:''
                  const val4 =  matchedStrings[4].includes('current_direction')?matchedStrings[4]:''
                  this.isPolarData(val,val2,val3 ,val4)
                }, 100);
                
              }else{
                
                this.isPolar = false;
                this.isCurrentPolar = false;
              }
              this.isLoad = false;
              }, 100);
            // return true;
          },
          (error) => {
            console.error(error);
            // return false;
            }
        )
  }


  onAssignDataForPolar(){
    setTimeout(() => {
      this.isPolarLoading = true
      console.log(this.numberr)
      const stringList: string[] = [];
      for (let index = 0; index < this.filteredparams.length; index++) {
        stringList.push(
          this.filteredparams[index].param_name
        )
      } 
      const word1 = "_direction";
      const word2 = "_height";
      const word3 = "_speed";
      const excludedParam = "mean_wave_direction";

      // Find if any string contains either of the two words
      const matchedStrings = stringList.filter(str =>
        str.toLowerCase().includes(word1.toLowerCase()) ||
        str.toLowerCase().includes(word2.toLowerCase()) ||
        str.toLowerCase().includes(word3.toLowerCase()) && str !== excludedParam
      );
      const matchFound = stringList.some(str =>
        str.toLowerCase().includes(word1.toLowerCase()) ||
        str.toLowerCase().includes(word2.toLowerCase()) ||
        str.toLowerCase().includes(word3.toLowerCase())
      );
      
      console.log("match",matchedStrings);
      if(matchFound ){
        console.log(matchedStrings.length);
        // this.selectedParams = [];
        // for(let i=0; i<matchedStrings.length; i++){
        //   const filter = this.listparams.filter(item=> item.param_name === matchedStrings[i])
        //   this.selectedParams.push(
        //     filter[i]
        //   )
        // this.selectedParams = this.listparams.filter(item=> item.param_name === matchedStrings[1])
        // }
        // this.numberr = 2;
        if(matchedStrings.includes('current')){
          this.isCurrentPolar = true;
          this.polarNumber = 2;
          this.isLoadingCurrentPolar = true;
           this.isPolarData(matchedStrings[0],matchedStrings[1], matchedStrings[3], matchedStrings[4])
        }else{
          this.polarNumber = 1
          this.isLoadingCurrentPolar = true;
          this.isPolarData(matchedStrings[0],matchedStrings[1])
        }
        
        const val = matchedStrings[0];
        const val2 = matchedStrings[1];
        
        // const bin = this.changewithBinPolar()
        console.log("polarrr",matchedStrings)
        setTimeout(() => {
          const val3 = matchedStrings[3].includes('current_speed')?matchedStrings[3]:''
          const val4 =matchedStrings[4].includes('current_direction')?matchedStrings[4]:''
          this.isPolar = true;
          this.isPolarData(val,val2, val3, val4)
        }, 100);
      }else{
        this.isPolar = false;
        this.isCurrentPolar = false;
      }
      this.isLoad = false;
      }, 100);
  }

  // new v2 for all design and ploting

  // variables
  plotType:string = 'line';

  changePlot(val:string){
    this.plotType = val;
  }

  // v3 code
  // ngOnInit(): void {
  // }

  // constructor(private http:HttpClient){
  // }

  changesingle(){
    this.singleAxis = []
    //console.log(this.selectedparam)
    if (this.selectedparam.includes('current')) {
      this.isCurrent = true;
      this.isSingledirection = true;
      // this.isSingleLoad = true;
    }else if(this.selectedparam.includes('heading')){
      this.isSingledirection = true;
      setTimeout(() => {
        this.assignSingleAxis(this.selectedparam);
      }, 100);
    }else{
      this.isCurrent = false;
      this.isSingleLoad = true;
      setTimeout(() => {
        this.assignSingleAxis(this.selectedparam);
      }, 100);
    }
  }



  MultiViewData: singleAxis[][] = [];
// MultiViewData2:singleAxis[] = [];
// MultiViewData3:singleAxis[] = [];
// MultiViewData4:singleAxis[] = [];
// MultiViewData5:singleAxis[] = [];


  changetiMultiView(){
    this.isSingleView = true;
    setTimeout(() => {
      this.assignMultiViewAxis()
    }, 100);
  }



  assignMultiViewAxis() {
    this.MultiViewData = []; // Reset
  
    for (let s = 0; s < this.selectedStation.length; s++) {
      const stationName = this.selectedStation[s];
      const stationData: singleAxis[] = [];
  
      for (let i = 0; i < this.buoyData.length; i++) {
        stationData.push({
          name: stationName,
          value: this.buoyData[i][stationName],
          DateTime: this.buoyData[i].datetime
        });
      }
  
      this.MultiViewData.push(stationData);
    }
  
    this.isSingleLoad = false;
    //console.log("MultiViewData:", this.MultiViewData);
  }



  changewithBin(){
    switch (this.selectedBin) {
      case 'profile1':
        this.selectedparam = this.selectedparam.includes('speed') ? 'current_speed_bin_1' : 'current_direction_bin_1';
        this.isSingleLoad = true;
      setTimeout(() => {
        
        this.assignSingleAxis(this.selectedparam);

      }, 100);
        break;
      case 'profile2':
        this.selectedparam = this.selectedparam.includes('speed') ? 'current_speed_bin_2' : 'current_direction_bin_2';
        this.isSingleLoad = true;
      setTimeout(() => {
        this.assignSingleAxis(this.selectedparam);
      }, 100);
        break;
      case 'profile3':
        this.selectedparam = this.selectedparam.includes('speed') ? 'current_speed_bin_3' : 'current_direction_bin_3';
        this.isSingleLoad = true;
      setTimeout(() => {
        this.assignSingleAxis(this.selectedparam);
      }, 100);
        break;
      case 'profile4':
        this.selectedparam = this.selectedparam.includes('speed') ? 'current_speed_bin_4' : 'current_direction_bin_4';
        this.isSingleLoad = true;
      setTimeout(() => {
        this.assignSingleAxis(this.selectedparam);
      }, 100);
        break;
      case 'profile5':
        this.selectedparam = this.selectedparam.includes('speed') ? 'cell_5_speed' : 'cell_5_dir';
        this.isSingleLoad = true;
      setTimeout(() => {
        this.assignSingleAxis(this.selectedparam);
      }, 100);
        break;
      default:
        break;
    }
  }
  
  changeScatterOne(){
    this.scatterAxis = []
    this.isScatterLoading= true;
    setTimeout(() => {
      this.assignScatterAxis(this.selectedScactterX, this.selectedScatterY );
    }, 100);
  }
  
  
  changetiMulOne(){
    this.multiAxis = []
    this.isMultiLoading= true;
    setTimeout(() => {
      
      this.assignMultiAxis(this.selectedMultix1, this.selectedMultix2 );
    }, 100);
  }

    fetchData(){   
      //console.log("selected station ID", this.singleStation)
      const filter = this.stations.filter(item=> item.name.includes(this.singleStation));
      //console.log("filter ====== ", filter[0].stationId)
      const toDate = '2025-04-01T23:59:00.000Z'
      const fromDate = '2025-04-01T00:00:42.000Z'
      const params = new HttpParams()
      .set('fromDate',this.fromDate)
      .set('toDate',this.toDate)
      .set('station_id', filter[0].stationId);
      this.http.get('http://localhost:3000/api/getSensorDataByDate', {params}).subscribe(
        (data:any) => {
          console.log("buoys data === ",data);
          this.buoyData =data
          this.fetchSensor();
        }
        ,
        (error) => {
          console.error('Error fetching sensor data', error);
          // alert('Failed to fetch sensor data. Please try again later.');
          }
      )
    }
  
  fetchSensor(){
    // this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
    //   (response:any)=>{
    //     console.log("sensor",response)
    //     this.sensorData = response
        // for (let index = 0; index < this.sensorData.length; index++) {
        //   this.parametres.push(
        //     response[index].param_name
        //   )
          
        // }
        this.selectedparam = this.filteredparams[0].param_name
  
  
        this.selectedScactterX = this.filteredparams[0].param_name;
        this.selectedScatterY = this.filteredparams[2].param_name;
        
        
        this.selectedMultix1 = this.filteredparams[1].param_name;
        this.selectedMultix2 = this.filteredparams[2].param_name;
        
        this.selectedMultiStationParam = this.filteredparams[0].param_name
        const for_polar = this.filteredparams.filter(item=> item.param_name.includes('_speed')&&item.param_name.includes('_direction'))
        //console.log("for polar,",this.filteredparams, for_polar)
        ////console.log(this.selectedScactterX, this.selectedScatterY)
        this.isSingleLoad = true;
        this.isScatterLoading = true;
        this.isSingledirection= true;
        this.isMultiLoading = true;
        setTimeout(() => {
          
          this.assignSingleAxis(this.selectedparam);
          this.assignScatterAxis(this.selectedScactterX, this.selectedScatterY)
          this.assignMultiAxis(this.selectedMultix1, this.selectedMultix2)
          // this.isPolar()
          this.onAssignDataForPolar()
        }, 100);
        // console.log("paramets:", this.parametres)
    //   },
    //   (error)=>{
    //     console.error('Error fetching station configuration', error);
    //   }
    // )
  }
  
    assignSingleAxis(val:string){

      this.singleAxis = []
      // this.fetchData()
          for (let index = 0; index < this.buoyData.length; index++) {
           this.singleAxis.push({
            name:val,
            value: this.buoyData[index][val.toLowerCase()],
            DateTime:this.buoyData[index].datetime
           })
          //  console.log("single val",this.singleAxis[index].value)
          }
          // console.log("single",this.singleAxis)
          this.isSingleLoad = false;
          if(this.selectedparam.includes('direction') || this.selectedparam.includes('heading')){

            this.isSingledirection = false,
            this.isSingleLoad = true
          }
          if(this.selectedparam.includes('current_speed')){
            this.selectedparam = 'current_speed'
          }else if(this.selectedparam.includes('current_direction')){
            this.selectedparam = 'current_direction'
          }
    }
   
    isPolarData(val:string, val2:string, val3?:string, val4?:string){
      this.PolarAxis = [];
      this.PolarAxis2 = [];
      this.isLoadingCurrentPolar = true;
      this.isPolarLoading = true;

      console.log("polar values", val, val2, val3, val4)
      for (let index = 0; index < this.buoyData.length; index++) {
        this.PolarAxis.push({
         name:val,
         speed: this.buoyData[index][val.toLowerCase()],
         direction:this.buoyData[index][val2.toLowerCase()]
        })
       //  console.log("single val",this.singleAxis[index].value)
       }
       if (val3&& val4) {
        const speed = this.changewithBinPolar(this.selectedBinPolar)
        console.log("current ", speed)
        this.isCurrentPolar = true;
        
        for (let index = 0; index < this.buoyData.length; index++) {
          this.PolarAxis2.push({
           name:val3 ?? 'current',
           speed: this.buoyData[index][speed[0].toLowerCase()],
           direction:this.buoyData[index][speed[1].toLowerCase()]
          })

        }
        console.log("Polar val", this.buoyData[0][speed[0].toLowerCase()])
         this.isLoadingCurrentPolar = false;
        }
       console.log("polar 1",this.PolarAxis,);
       console.log("polar 2",  this.PolarAxis2);
       this.isPolar = true;
       this.isPolarLoading = false;
      //  this.isLoadingCurrentPolar = false;
    }
  
  
      assignScatterAxis(valx:string, valy:string){
        this.scatterAxis= []
        console.log(valx, valy);
        for (let index = 0; index < this.buoyData.length; index++) {
         this.scatterAxis.push({
          name1:valx,
          name2: valy,
          value1: this.buoyData[index][valx.toLowerCase()],
          value2: this.buoyData[index][valy.toLowerCase()],
          // DateTime:this.buoyData[index].datetime
         })
        //  console.log(this.scatterAxis[0]); 
        }
        console.log("Scatter",this.scatterAxis)
        this.isScatterLoading = false;
    }
  
  
    assignMultiAxis(valx:string, valy:string){
      this.multiAxis = []
      console.log(valx, valy);
      for (let index = 0; index < this.buoyData.length; index++) {
        
       this.multiAxis.push({
        name1:valx,
        name2: valy,
        value1: this.buoyData[index][valx],
        value2: this.buoyData[index][valy],
        timestamps:this.buoyData[index].datetime
        // DateTime:this.buoyData[index].datetime
       })
        
      }
  
      console.log("Scatter",this.scatterAxis)
      this.isMultiLoading = false;

  }



  selectedBinPolar:string = 'profile1';
  isCurrentPolar:boolean = false;
  polarNumber:number = 0;

  changePOlarCurrentBin(){
    setTimeout(() => {
     const resutl =  this.changewithBinPolar(this.selectedBinPolar);
      this.isPolarData_current(resutl[0], resutl[1])
    }, 100);
  }

  changewithBinPolar(val:string):string[]{
    switch (val) {
      case 'profile1':
        return ['current_speed_bin_1', 'current_direction_bin_1'];
        break;
      case 'profile2':
        return ['current_speed_bin_2', 'current_direction_bin_2'];
        break;
      case 'profile3':
        return ['current_speed_bin_3', 'current_direction_bin_3'];
        break;
      case 'profile4':
        return ['current_speed_bin_4', 'current_direction_bin_4'];
        break;
      case 'profile5':
        return ['current_speed_bin_5', 'current_direction_bin_5'];
        break;
      default:
        return ['', '']
        break;
    }
  }
isLoadingCurrentPolar:boolean=false;
  isPolarData_current(val:string, val2:string){
    this.isLoadingCurrentPolar = true;

this.PolarAxis = [];
    for (let index = 0; index < this.buoyData.length; index++) {
      this.PolarAxis.push({
       name:val,
       speed: this.buoyData[index][val.toLowerCase()],
       direction:this.buoyData[index][val2.toLowerCase()]
      })
     //  console.log("single val",this.singleAxis[index].value)
     }
     
     console.log("poalr",this.PolarAxis)
     setTimeout(() => {
       this.isPolar = true;
       this.isLoadingCurrentPolar = false;
     }, 100);
  }

}
