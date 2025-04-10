import { Component, OnInit } from '@angular/core';
import { MapService } from '../map_service/map.service';
import { RadarHomeComponent } from "../radar-home/radar-home.component";
import { HomeV1ChartComponent } from "../home-v1-chart/home-v1-chart.component";
import { WindGaugeComponent } from "../wind-gauge/wind-gauge.component";
import { BuoyComponent } from "../buoy/buoy.component";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { Direction1Component } from "../widgets/direction1/direction1.component";
import { Gauge2Component } from "../widgets/gauge2/gauge2.component";

@Component({
    selector: 'app-home',
    standalone:true,
    imports: [RadarHomeComponent, HomeV1ChartComponent, WindGaugeComponent, BuoyComponent, Direction1Component, Gauge2Component],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {

}
