import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PolarAxis } from '../analytics.component';


PlotlyModule.plotlyjs = PlotlyJS;
@Component({
  selector: 'app-rose-plot',
  imports: [PlotlyModule],
  standalone:true,
  templateUrl: './rose-plot.component.html',
  styleUrl: './rose-plot.component.css',
  providers:[
    
  ]
})
export class RosePlotComponent implements OnInit{
  @Input() polarAxis: PolarAxis[] = [];
  chartOptions: any;

  ngOnInit(): void {
    const directions: number[] = [];
    const speeds: number[] = [];

    for (const item of this.polarAxis) {
      const dir = parseFloat(item.direction);
      const spd = parseFloat(item.speed);
      if (!isNaN(dir) && !isNaN(spd)) {
        directions.push(dir);
        speeds.push(spd);
      }
    }

    this.chartOptions = {
      title: {
        text: 'Wind Rose Plot',
        left: 'left',
        textStyle: {
          fontSize: 24,
          color: '#000',
        }
      },
      angleAxis: {
        type: 'category',
        data: directions.map(d => `${d}°`),
        clockwise: true,
        startAngle: 90
      },
      radiusAxis: {
        type: 'value',
        min: 0,
        max: 30
      },
      polar: {},
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => 
          `Direction: ${params.name}<br>Speed: ${params.value} m/s`
      },
      series: [
        {
          type: 'bar',
          data: speeds,
          coordinateSystem: 'polar',
          name: 'Wind Speed',
          itemStyle: {
            color: (params: any) => {
              const value = params.value;
              return `rgba(${Math.min(255, value * 10)}, 50, 200, 0.8)`;
            }
          }
        }
      ],
      legend: {
        show: true,
        data: ['Wind Speed'],
        top: 'bottom'
      }
    };
  }
}
