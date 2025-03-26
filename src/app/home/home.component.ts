import { Component, OnInit } from '@angular/core';
import { MapService } from '../map_service/map.service';
import { RadarHomeComponent } from "../radar-home/radar-home.component";
import { HomeV1ChartComponent } from "../home-v1-chart/home-v1-chart.component";
import { BuoyComponent } from "../buoy/buoy.component";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { Direction1Component } from "../widgets/direction1/direction1.component";
import { Gauge2Component } from "../widgets/gauge2/gauge2.component";
import { Gauge3Component } from '../widgets/gauge3/gauge3.component';
import { Direction2Component } from '../widgets/direction2/direction2.component';
import { math } from '@amcharts/amcharts5';

@Component({
    selector: 'app-home',
    standalone:true,
    imports: [RadarHomeComponent, HomeV1ChartComponent, BuoyComponent, Direction2Component, Gauge3Component],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
    rotationDegree: number = 180; // Default rotation

    rotateNeedle(degree: number) {
      this.rotationDegree = degree;
    }
ngOnInit(): void {
    setInterval(() => {
        this.rotationDegree = Math.random() * (360 - 0) + 0;;
        console.log(this.rotationDegree);
    }, 2000);
}
  
}
