import { Component, OnInit } from '@angular/core';
import { SingleAxisComponent } from "./single-axis/single-axis.component";
import { MultiAxisComponent } from "./multi-axis/multi-axis.component";
import { ScatterAxisComponent } from "./scatter-axis/scatter-axis.component";
import { RosePlotComponent } from "./rose-plot/rose-plot.component";
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Station } from '../model/station.model';
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
  selector: 'app-homeanalysis',
  standalone:true,
  imports: [SingleAxisComponent, CommonModule,FormsModule, MultiAxisComponent, ScatterAxisComponent, RosePlotComponent, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeAnalysisComponent implements OnInit{
  parametres:string[]=[];
  sensorData: any[] = [];
  buoyData:Station[]=[];
  isSingleLoad:boolean = false;
  isMultiLoading: boolean = true;
  isScatterLoading: boolean = false;
  isPolarLoading: boolean = false;


  selectedparam:string = 'wave_heading';
  selectedMultix1:string = 'wave_heading';
  selectedMultix2:string = 'wave_direction';

  selectedScactterX!:string;
  selectedScatterY!:string;
  singleAxis:singleAxis[]=[]
  multiAxis:MultiAxis[] = []
  scatterAxis:ScatterAxis[] = [];
  PolarAxis:PolarAxis[] = [];
  
  ngOnInit(): void {
      this.fetchData();
      
  }
constructor(private http:HttpClient){

}
changesingle(){
  this.singleAxis = []
  this.isSingleLoad = true;
  setTimeout(() => {
    
    this.assignSingleAxis(this.selectedparam);
  }, 100);
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
    
    this.assignMultiAxis(this.selectedScactterX, this.selectedScatterY );
  }, 100);
}
  fetchData(){   
    const toDate = '2025-03-31T23:59:00.000Z'
    const fromDate = '2025-02-01T00:00:42.000Z'
    const params = new HttpParams()
    .set('fromDate',fromDate)
    .set('toDate',toDate);
    this.http.get('http://192.168.0.147:3000/api/getSensorDataByDate', {params}).subscribe(
      (data:any) => {
        console.log("",data);
        this.buoyData =data
        this.fetchSensor();
      }
      ,
      (error) => {
        console.error('Error fetching sensor data', error);
        alert('Failed to fetch sensor data. Please try again later.');
        }
    )
  }

fetchSensor(){
  this.http.get('http://192.168.0.147:3000/api/getSensorConfig').subscribe(
    (response:any)=>{
      console.log("sensor",response)
      this.sensorData = response
      for (let index = 0; index < this.sensorData.length; index++) {
        this.parametres.push(
          response[index].param_name
        )
        
      }
      this.selectedparam = this.parametres[0]


      this.selectedScactterX = this.parametres[0];
      this.selectedScatterY = this.parametres[2];
      
      
      this.selectedMultix1 = this.parametres[1];
      this.selectedMultix2 = this.parametres[2];
      
      
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
    },
    (error)=>{
      console.error('Error fetching station configuration', error);
    }
  )
}

  assignSingleAxis(val:string){
    
        for (let index = 0; index < this.buoyData.length; index++) {
          
         this.singleAxis.push({
          name:val,
          value: this.buoyData[index][val],
          DateTime:this.buoyData[index].datetime
         })
          
        }

        console.log("single",this.singleAxis)
        this.isSingleLoad = false;
        
    }



    assignScatterAxis(valx:string, valy:string){
      console.log(valx, valy);
      for (let index = 0; index < this.buoyData.length; index++) {
        
       this.scatterAxis.push({
        name1:valx,
        name2: valy,
        value1: this.buoyData[index][valx],
        value2: this.buoyData[index][valy],
        // DateTime:this.buoyData[index].datetime
       })
        
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
