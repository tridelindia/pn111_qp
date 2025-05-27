import { Component, OnInit } from '@angular/core';
import { RadialGaugeComponent } from '../../widgets/radial-guage/radial-guage.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { text } from 'express';
import { HttpClient, HttpClientModule } from '@angular/common/http';
interface Sensors{
  id: number;
  timestamp:string;
  name: string;
  param_name: string;
  unit: string;
  warning:string;
  danger:string;
  notification:string
}
@Component({
  selector: 'app-sensor',
  imports: [RadialGaugeComponent, CommonModule, FormsModule, HttpClientModule],
  standalone:true,
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.css'
})
export class SensorComponent implements OnInit{
  selectedSensor:string = 'ocean';
  tableData?:Sensors[];
  mainToggle:boolean = false;
  editData!:Sensors;
  isMulti:boolean = false;
  isFirst:number = 1;
  selectedUnit:string = 'µg/L';
  multiData:string[] = [];
  PAH:string[]= ['µg/L', 'ppb', 'ppm'];
  oil_in_water:string[]= ['mg/L', 'ppm', 'ppb'];
  BT:string[]= ['µg/L', 'ppb'];
  chlorophyll_a:string[]= ['µg/L', 'RFU'];
  salinity:string[]= ['PSU', 'ppt', 'g/kg'];
  wind_speed:string[]= ['m/s', 'km/h', 'knots'];
  wind_gust:string[]= ['m/s', 'km/h', 'knots'];
  temperature:string[]= ['°C', '°F', 'K'];
  rainfall:string[]= ['mm', 'cm'];
  current_speed:string[]= ['m/s', 'cm/s', 'knots'];



  constructor(
    private http:HttpClient
  ){}
  ngOnInit(): void {
   this.saveData()

  }
  
  saveData(){
    try {
      this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
        (response:any) => {
          console.log("api",response);
          this.sampleData = response;
          this.tableData = this.sampleData.filter(item => item.name === 'oceanography');
          console.log(this.tableData);
          if(this.isFirst === 1){
            this.onEdit(this.tableData[0]);
          }
          this.isFirst = this.isFirst +1;
          // return true;
          },
          (error) => {
            console.error(error);
            // return false;
            }
          )
          // return true
    } catch (error) {
      // return false
    }
    
  }



  Update(){
    this.http.post('http://localhost:3000/api/updateSensor', this.editData).
    subscribe(
      (response:any) => {
        console.log(response);
        this.saveData();
      },
        (error) => {
          console.error(error);
      }
    )
  }

  onUnitSelect(unit:string){
    this.selectedUnit = unit;
    this.editData.unit = unit;
  }
  onEdit(item:any){
    this.editData =item;
    this.mainToggle = item.notification === 'enabled';
    console.log(this.editData);
    if(item.param_name === 'PAH'){
      this.isMulti = true;
      this.multiData = this.PAH
      this.selectedUnit = item.unit;
    }else if(item.param_name === 'oil_in_water'){
      this.isMulti = true;
      this.multiData = this.oil_in_water
      this.selectedUnit = item.unit;
    }else if(item.param_name === 'BT'){
        this.isMulti = true;
        this.multiData = this.BT
        this.selectedUnit = item.unit;
    }else if(item.param_name === 'chlorophyll_a'){
        this.isMulti = true;
        this.multiData = this.chlorophyll_a
        this.selectedUnit = item.unit;
    }else if(item.param_name === 'salinity'){
        this.isMulti = true;
        this.multiData = this.salinity
        this.selectedUnit = item.unit;
    }else if(item.param_name === 'wind_speed'){
        this.isMulti = true;
        this.multiData = this.wind_speed
        this.selectedUnit = item.unit;
     }else if(item.param_name === 'wind_gust'){
        this.isMulti = true;
        this.multiData = this.wind_gust
        this.selectedUnit = item.unit;
     }else if(item.param_name === 'rainfall'){
        this.isMulti = true;
        this.multiData = this.rainfall
        this.selectedUnit = item.unit;
     }else if(item.param_name === 'temperature'){
        this.isMulti = true;
        this.multiData = this.temperature
        this.selectedUnit = item.unit;
     }else if(item.param_name === 'current_speed'){
        this.isMulti = true;
        this.multiData = this.current_speed
        this.selectedUnit = item.unit;
         } else{
          this.isMulti = false;
          this.selectedUnit = item.unit;
         }

  }

  toggle(){

      this.mainToggle = !this.mainToggle;
  }
  onSensorSelect(name:string){
    this.selectedSensor = name;
    if(name === 'ocean'){

      this.tableData = this.sampleData.filter(item => item.name === 'oceanography');
    }else if(name === 'met'){
      this.tableData = this.sampleData.filter(item => item.name === 'meteorology');
    }else if(name === 'wat'){
      this.tableData = this.sampleData.filter(item => item.name === 'water_quality');
    }else if(name === 'mic'){
      this.tableData = this.sampleData.filter(item => item.name === 'microflu');
    }

  }
  sampleData:Sensors[] = [];  




}
