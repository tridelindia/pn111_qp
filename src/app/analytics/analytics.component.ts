import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TestChartComponent } from "./test-chart/test-chart.component";
import { HeatmapComponent } from "./heatmap/heatmap.component";
import { LineChartComponent } from "./line-chart/line-chart.component";
import { AuthService } from '../services/auth.service';
interface param{
  param_name:string;
  name:string;
}
@Component({
  selector: 'app-analytics',
  standalone:true,
  imports: [CommonModule, HttpClientModule, TestChartComponent, HeatmapComponent, LineChartComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit{
  selectedSensor:string = 'oceanography';
  listparams:param[] = [];
  filteredparams:param[]=[];
  selectedParams:param[]=[];
  isSingleView:boolean = true;
  numberr:number = 2;
  isSelectParams:boolean = false;

  isTest(){
    this.numberr = this.selectedParams.length;
    console.log(this.numberr)
  }

  isViewChange(value:string){
    if(value == 'single'){
      this.isSingleView = true;
    }else{
      this.isSingleView = false;
    }
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

    
  }

  loggedInUser: any;




  hasPermissions(page: string, requiredPermissions: string[]): boolean {
    const rolePermissions = this.loggedInUser?.role?.permissions || {}; // role has permissions
    const pagePermissions = rolePermissions[page] || [];
    return requiredPermissions.every(p => pagePermissions.includes(p));
  }  

  ngOnInit(): void {
      this.fetchSensors()
      this.loggedInUser = this.authService.getCurrentUser(); // or whatever method returns user info 
  }

  constructor(
    private http:HttpClient,
    private authService: AuthService
  ){}

  fetchSensors(){
    this.http.get('http://localhost:3000/api/getSensorConfig').subscribe(
      (response:any) => {
        console.log(response);
          this.listparams = response;
          console.log("params",this.listparams.length)
          this.filteredparams = this.listparams.filter(item => item.name === 'oceanography');
        // return true;
        },
        (error) => {
          console.error(error);
          // return false;
          }
        )
  }
}
