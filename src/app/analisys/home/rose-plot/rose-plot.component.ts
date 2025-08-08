import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PolarAxis } from '../home.component';
import { math } from '@amcharts/amcharts5';

PlotlyModule.plotlyjs = PlotlyJS;
@Component({
  selector: 'app-rose-plot',
  imports: [PlotlyModule],
  standalone:true,
  templateUrl: './rose-plot.component.html',
  styleUrl: './rose-plot.component.css'
})

export class RosePlotComponent implements OnInit{
  @Input() polarAxis:PolarAxis[] = []
  public graph:any;
  @Input() id!:string;
  title!:string;
  V_WIND:number[] = [];
  DIR_WIND:number[] = [];

  ngOnInit(): void {
    console.log("inside polar",this.polarAxis)
      for (let index = 0; index < this.polarAxis.length; index++) {
        const speed = parseFloat(this.polarAxis[index].speed)
        this.V_WIND.push(speed)
        this.DIR_WIND.push(parseFloat(this.polarAxis[index].direction));
      }
      this.title = this.polarAxis[0].name.includes('wave')?'Wave':this.polarAxis[0].name.includes('current') ?'Current':this.polarAxis[0].name.includes('wind')?'Wind':'Polar'
      this.setChart()
  }
// 'Viridis'
// 'Plasma'
// 'Inferno'
// 'Magma'
// 'Cividis'
// 'Blues'
// 'Greens'
// 'Greys'
// 'Oranges'
// 'Purples'
// 'Reds'
// 'Turbo'         // vivid & smooth gradient

  setChart() {
    this.graph = {
      data: [
        {
          type: 'barpolar',
          r: this.V_WIND,
          theta: this.DIR_WIND,
          mode: 'markers',
          width: Array(this.V_WIND.length).fill(15),
          marker: {
            // size: 100,
            color: this.V_WIND,
            colorscale: 'Blues',
            opacity: 0.8,
            colorbar: {
              title: 'Wind Speed',
              x: 1.1
            }
          },
          name: 'Wind Observations',
          hovertemplate: 'Direction: %{theta}<br>Speed: %{r} m/s<extra></extra>'
        }
      ],
      layout: {
        autosize: true,
        responsive: true,
        title: {
          text: this.title,
          font: {
            family: 'Arial, sans-serif',
            size: 20,
            weight:'bold',
            color: '#4b4b4b'
          },
          x: 1.2,
          xanchor: 'right',
          y:3,
          yanchor: 'bottom'
        },
        polar: {
          radialaxis: {
            visible: true,
            range: [0, Math.max(...this.V_WIND) * 1.2]
          },
          angularaxis: {
            rotation: 90,
            direction: 'clockwise'
          }
        },
        showlegend: false
      }
    };
  }
}
