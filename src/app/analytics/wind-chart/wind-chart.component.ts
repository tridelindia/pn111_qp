import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as echarts from 'echarts';
import * as PlotlyJS from 'plotly.js-dist-min';

PlotlyModule.plotlyjs = PlotlyJS;
@Component({
  selector: 'app-wind-chart',
  imports:[PlotlyModule],
  standalone:true,
  templateUrl: './wind-chart.component.html',
  styleUrls: ['./wind-chart.component.css']
})
export class WindChartComponent {
  public graph = {
    data: [
      {
        type: 'scatterpolar',
        r: [5, 10, 15, 20, 25], // Replace with your df['V_WIND']
        theta: [0, 45, 90, 135, 180], // Replace with your df['DIR_WIND']
        mode: 'markers',
        marker: {
          size: [150, 300, 450, 600, 750], // e.g. V_WIND * 30
          color: [5, 10, 15, 20, 25],      // Same as r
          colorscale: 'Plasma',
          sizemode: 'area',
          colorbar: {
            title: 'Wind Speed',
            x: 0.45,
            len: 0.4
          }
        },
        name: 'Wind Rose'
      }
    ],
    layout: {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, 30] // Adjust as needed
        }
      },
      showlegend: true
    }
  };
}
