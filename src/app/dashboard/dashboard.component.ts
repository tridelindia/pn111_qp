import { Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-dashboard',
    standalone:true,
    imports: [RadarHomeComponent, HomeV1ChartComponent, WindGaugeComponent, BuoyComponent, Gauge2Component, Direction1Component, CommonModule, RotaryDialComponent, DataScoreComponent, Gauge3Component, Direction2Component, BatteryComponent, Gauge1Component, Direction3Component],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  constructor(private map:MapService){}
  direction1:number = 110;
  direction_val:string = '';
  direction2_val:string = '';
  direction2:number = 180;
  direction3:number = 250;
  
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

  showMap:boolean = false;

toggleMapon(){
  this.map.destroyMap();
  this.showMap = true;
  setTimeout(() => {
    
    this.mapInit()
  }, 100);
}
toggleMapoff(){
  this.map.destroyMap();
  this.showMap = false;
}
    ngOnInit(): void {
      this.direction_val = this.directionValue(this.direction1);
      this.direction2_val = this.directionValue(this.direction2);
      this.map.destroyMap();
      // const mapContainer = document.getElementById('ol-map');
      // if(mapContainer){
      //   this.map.createMap(mapContainer!, 18.997888,  72.809304, 20, 40, 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}');
      //   // this.map.addPathLines();
      // }
      this.directionAndvalue()
      // this.mapInit();
    }


    mapInit(){
      const mapContainer = document.getElementById('ol-map');
      this.map.createMap(
        mapContainer!,
        40.7128,
       -74.0060, 
      20, 40, 'http://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
        
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
    
      console.log('Directions and Corresponding Values:');
      console.log(`D1: ${this.direction.toFixed(2)} -> ${this.d1_value}`);
      console.log(`D2: ${this.direction22.toFixed(2)} -> ${this.d2_value}`);
      console.log(`D3: ${this.direction33.toFixed(2)} -> ${this.d3_value}`);
      console.log(`D4: ${this.direction4.toFixed(2)} -> ${this.d4_value}`);
      console.log(`D5: ${this.direction5.toFixed(2)} -> ${this.d5_value}`);
      console.log(`D6: ${this.direction6.toFixed(2)} -> ${this.d6_value}`);
      console.log(`D7: ${this.direction7.toFixed(2)} -> ${this.d7_value}`);
      console.log(`D8: ${this.direction8.toFixed(2)} -> ${this.d8_value}`);
      console.log(`D9: ${this.direction9.toFixed(2)} -> ${this.d9_value}`);
      console.log(`D10: ${this.direction10.toFixed(2)} -> ${this.d10_value}`);
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
