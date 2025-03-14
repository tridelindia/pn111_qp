import { Component, OnInit } from '@angular/core';
import { MapService } from '../map_service/map.service';
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

@Component({
  selector: 'app-dashboard',
  standalone:true,
  imports: [RadarHomeComponent, HomeV1ChartComponent, WindGaugeComponent, BuoyComponent, Gauge2Component, Direction1Component, CommonModule, RotaryDialComponent, DataScoreComponent, Gauge3Component, Direction2Component],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  constructor(private map:MapService){}
  direction1:number = 110;
  direction2:number = 180;
  direction3:number = 250;
  
  speed1:number = 4;
  speed2:number = 9;
  speed3:number = 15;
  
    ngOnInit(): void {
      this.map.destroyMap();
      const mapContainer = document.getElementById('ol-map');
      if(mapContainer){
        this.map.createMap(mapContainer!, 18.997888,  72.809304);
        this.map.addPathLines();
      }
      
    }
  
}
