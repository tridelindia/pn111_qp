import { Component } from '@angular/core';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { CommonModule } from '@angular/common';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-chart2',
  standalone: true,
  imports: [PlotlyModule, CommonModule],
  templateUrl: './chart2.component.html',
  styleUrl: './chart2.component.css'
})
export class Chart2Component {

  // Simulated data for demonstration
  datetime = [
    new Date('2024-01-01T00:00:00'),
    new Date('2024-01-01T01:00:00'),
    new Date('2024-01-01T02:00:00')
  ];
  V_WIND = [5, 10, 7];
  V_WIND2 = [3, 8, 5];
  v = [5, 2, 1.5];
  v2 = [2, 3, 2.5]; // Offset values for annotation arrowhead

  public graph: any;

  constructor() {
    const annotations2 = [];
    const annotations = [];

    for (let i = 0; i < this.datetime.length; i++) {
      annotations.push({
        x: new Date(this.datetime[i].getTime() + 1000), // +1 second
        y: this.V_WIND[i] + this.v[i],
        ax: this.datetime[i],
        ay: this.V_WIND[i],
        xref: 'x',
        yref: 'y',
        axref: 'x',
        ayref: 'y',
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 1.5,
        arrowcolor: 'crimson',
        opacity: 0.7,
        showarrow: true
      });
      annotations2.push({
        x: new Date(this.datetime[i].getTime() + 1000), // +1 second
        y: this.V_WIND[i] + this.v2[i],
        ax: this.datetime[i],
        ay: this.V_WIND[i],
        xref: 'x',
        yref: 'y',
        axref: 'x',
        ayref: 'y',
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 1.5,
        arrowcolor: 'crimson',
        opacity: 0.7,
        showarrow: true
      });
    }

    this.graph = {
      data: [
        {
          x: this.datetime,
          y: this.V_WIND,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Wind Speed',
          line: { color: 'blue' }
        },
        {
          x: this.datetime,
          y: this.V_WIND2,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Wind Speed',
          line: { color: 'amber' }
        }
      ],
      layout: {
        title: 'Wind Speed with Arrows',
        autosize: true,
        margin: { t: 50, l: 40, r: 30, b: 40 },
        xaxis: { title: 'Time' },
        yaxis: { title: 'Wind Speed (m/s)' },
        annotations: annotations
      },
      config: {
        responsive: true
      }
    };
  }
}
