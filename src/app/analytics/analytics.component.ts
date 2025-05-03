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
  imports: [CommonModule, HttpClientModule,DatePickerModule, FormsModule, ScrollingModule, TestChartComponent, Chart2Component, WindChartComponent, ScatterComponent, MultiSelectModule, FormsModule, MultiAxisComponent, SingleAxisComponent, ScatterAxisComponent, RosePlotComponent, FormsModule, DirectionChartComponent],
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
  isLoad:boolean = false;
  scatData:scatData[] = []
  Buoy:BuoyData[]=[];


  isPolar:boolean = false;
  items = Array.from({ length: 1000 }, (_, i) => `Item #${i}`);
  selectedMultiStationParam!:string;

  isCurrent:boolean= false;
  selectedBin!:string;
  Bins:any[] = [{
    name:'profile1',
    id:'001'
  }, 
  {
    name:'profile2',
    id:'002'
  }, 
  {
    name:'profile3',
    id:'003'
  }, 
  {
    name:'profile4',
    id:'004'
  }, ];

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
      this.reportService.getAllSensorData(stationId)
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
  

  isTest(){
      this.isLoad = true;
      console.log("selected Stations", this.selectedStation)
      this.changetiMultiStationView();
      setTimeout(() => {
        this.numberr = this.selectedParams.length;
        console.log(this.numberr)
        const stringList: string[] = [];
        for (let index = 0; index < this.selectedParams.length; index++) {
          stringList.push(
            this.selectedParams[index].param_name
          )
        } 
        
        const word1 = "_direction";
        const word2 = "_height";
        
        // Find if any string contains either of the two words
        const matchedStrings = stringList.filter(str =>
          str.toLowerCase().includes(word1.toLowerCase()) ||
          str.toLowerCase().includes(word2.toLowerCase())
        );
        const matchFound = stringList.some(str =>
          str.toLowerCase().includes(word1.toLowerCase()) ||
          str.toLowerCase().includes(word2.toLowerCase())
        );
        
        console.log("match",matchedStrings);
        if(matchFound && matchedStrings.length == 2){
          console.log(matchedStrings.length);
          this.selectedParams = [];
          for(let i=0; i<matchedStrings.length; i++){

            const filter = this.listparams.filter(item=> item.param_name === matchedStrings[i])
            this.selectedParams.push(
              filter[i]
            )
            // this.selectedParams = this.listparams.filter(item=> item.param_name === matchedStrings[1])
          }
          this.numberr = 2;
          this.isPolar = true;
          
        }else{
          
          this.isPolar = false;
        }
        this.isLoad = false;
        }, 100);

        const startDate= new Date(this.selectedDate[0]);
        startDate.setHours(0,0,0,0);

        const endDate = new Date(this.selectedDate[1]);
        endDate.setHours(23,59,0,0);
        console.log("date", this.selectedDate, startDate.toLocaleString(), endDate.toISOString())

  }

  isViewChange(value:string){
    if(value == 'single'){
      this.selectedMultiStationParam = this.filteredparams[0].param_name
      this.isSingleView = true;
    }else{
      this.isSingleView = false;

    }
  }


  onDatePicked(){

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

    if(this.plotType === 'polar'){
      this.filteredparams = this.filteredparams.filter(item=> item.param_name.includes('direction') || item.param_name.includes('speed')||item.param_name.includes('height'))
    }
  }


  ngOnInit(): void {
     this.http.get('http://localhost:3000/api/getStationConfig').subscribe(
            (response: any) => {
                console.log(response);
                for (let index = 0; index < response.length; index++) {
                    this.stations.push({
                      stationId: response[index].station_id,
                      name:response[index].station_name})
                }
                // this.selectedStation = this.stations;
                
                this.singleStation = this.stations[0].name;
                console.log("==============================================")
                console.log("single station is", this.stations[0].name, this.singleStation)

                console.log("selected station param====", this.selectedMultiStationParam)
                console.log("==============================================")
                this.selectedStation = [this.stations[0].stationId]
                    console.log("station",this.stations, this.selectedStation);
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
    private reportService:ReportService
  ){}


  onPlotSelect(event:Event){
    this.isLoad = true;
    this.isSingleLoad = true;
    this.isMultiLoading = true;
    setTimeout(() => {
      
      const selectedValue = (event.target as HTMLSelectElement).value;
    console.log(selectedValue);
    this.selectedPlot = selectedValue;
    this.isLoad = false;
    this.isSingleLoad = false;
    this.isMultiLoading = false
    }, 100);
  }


  // Api Calls

  fetchSensorData(){
    this.fetchSensors()
    // const date = new Date();
    const toDate = '2025-02-30T23:59:00.000Z'
    const fromDate = '2025-02-01T00:00:42.000Z'
    const dates = {
      fromDate: fromDate,
      toDate: toDate
    }
    console.log("selected Station ID===",  this.stations[0].stationId )

   const params = new HttpParams()
    .set('fromDate',fromDate)
    .set('toDate',toDate)
    .set('station_id', this.stations[0].stationId);
    this.http.get('http://localhost:3000/api/getSensorDataByDate', {params} ).subscribe(
      (response: any) => {
        this.Buoy = response;
        console.log("buoy",this.Buoy, this.filteredparams);
        this.buoyData = response
        if (this.buoyData.length < 0) {
          this.selectedparam = this.filteredparams[0].param_name
  
          this.selectedScactterX =  this.filteredparams[1].param_name;
          this.selectedScatterY =  this.filteredparams[2].param_name;
          
          this.selectedMultix1 =  this.filteredparams[1].param_name;
          this.selectedMultix2 =  this.filteredparams[2].param_name;
          console.log("==============================================")
          this.selectedMultiStationParam = this.filteredparams[0].param_name
          console.log("selected station param====",this.filteredparams, this.selectedMultiStationParam)
          console.log("==============================================")
         
        this.isSingleLoad = true;
          this.isScatterLoading = true;
          this.isMultiLoading = true;
          
          setTimeout(() => {
            this.assignSingleAxis(this.selectedparam);
            this.assignScatterAxis(this.selectedScactterX, this.selectedScatterY)
            this.assignMultiAxis(this.selectedMultix1, this.selectedMultix2)
          }, 100);  
          // this.fetchData()
        }
       
        
        },
        (error: any) => {
          console.log(error);
          }
    )
  }

  fetchSensors(){
    this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
      (response:any) => {
        console.log(response);
          this.listparams = response;
          console.log("params",this.listparams.length)
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
  
          this.singleStation = this.stations[0].name;
        this.selectedScactterX =  this.filteredparams[1].param_name;
        this.selectedScatterY =  this.filteredparams[2].param_name;
        
        
        this.selectedMultix1 =  this.filteredparams[1].param_name;
        this.selectedMultix2 =  this.filteredparams[2].param_name;
        console.log("==============================================")
          this.selectedMultiStationParam = this.filteredparams[0].param_name
          console.log("selected station param====",this.filteredparams, this.selectedMultiStationParam)
          console.log("==============================================")
        
        console.log(this.selectedScactterX, this.selectedScatterY)
        this.isSingleLoad = true;
        this.isScatterLoading = true;
        this.isMultiLoading = true;
        this.fetchData();
        // if(this.buoyData.length > 0){

          console.log("step 1 reached")
        // }
       
        console.log("paramets:", this.parametres)
          
          
          this.isTest();
          // return true;
        },
        (error) => {
          console.error(error);
          // return false;
          }
        )
  }


  onAssignData(){

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
    console.log(this.selectedparam)
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
    console.log("MultiViewData:", this.MultiViewData);
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
      console.log("selected station ID", this.singleStation)
      const filter = this.stations.filter(item=> item.name.includes(this.singleStation));
      console.log("filter ====== ", filter[0].stationId)
      const toDate = '2025-03-31T23:59:00.000Z'
      const fromDate = '2025-02-01T00:00:42.000Z'
      const params = new HttpParams()
      .set('fromDate',fromDate)
      .set('toDate',toDate)
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
        console.log(this.selectedScactterX, this.selectedScatterY)
        this.isSingleLoad = true;
        this.isScatterLoading = true;
        this.isMultiLoading = true;
        setTimeout(() => {
          
          this.assignSingleAxis(this.selectedparam);
          this.assignScatterAxis(this.selectedScactterX, this.selectedScatterY)
          this.assignMultiAxis(this.selectedMultix1, this.selectedMultix2)
        }, 100);
        console.log("paramets:", this.parametres)
    //   },
    //   (error)=>{
    //     console.error('Error fetching station configuration', error);
    //   }
    // )
  }
  
    assignSingleAxis(val:string){
      // this.fetchData()
          for (let index = 0; index < this.buoyData.length; index++) {
           this.singleAxis.push({
            name:val,
            value: this.buoyData[index][val.toLowerCase()],
            DateTime:this.buoyData[index].datetime
           })
          //  console.log("single val",this.singleAxis[index].value)
          }
          console.log("single",this.singleAxis)
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
   
  
  
      assignScatterAxis(valx:string, valy:string){
        console.log(valx, valy);
        for (let index = 0; index < this.buoyData.length; index++) {
          
         this.scatterAxis.push({
          name1:valx,
          name2: valy,
          value1: this.buoyData[index][valx.toLowerCase()],
          value2: this.buoyData[index][valy.toLowerCase()],
          // DateTime:this.buoyData[index].datetime
         })
         console.log(this.scatterAxis[0]);
          
        }
  
        console.log("Scatter",this.scatterAxis)
        this.isScatterLoading = false;
        
    }
  
  
    assignMultiAxis(valx:string, valy:string){
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
}
