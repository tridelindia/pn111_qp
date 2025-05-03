import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PolarAxis } from '../home.component';

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

  V_WIND:number[] = [];
  DIR_WIND:number[] = []
  ngOnInit(): void {
      for (let index = 0; index < this.polarAxis.length; index++) {
        const speed = parseFloat(this.polarAxis[index].speed)
        this.V_WIND.push(speed)
        this.DIR_WIND.push(parseFloat(this.polarAxis[index].direction));
        
      }
      this.setChart()
  }

  setChart(){
    this.graph = {
      data: [
        {
          
          type: 'barpolar',
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
              x: 0.20,
              len: 0.8,
              thickness: 15,
              left:30
            }
          },
          name: 'Wind Rose',
          hovertemplate:
      'Direction: %{theta}°<br>' +
      'Speed: %{r} m/s<extra></extra>' 
        }
      ],
      layout: {
        autosize: true,
        responsive: true,
        title: {
          text: 'Wind Rose Plot', // Replace with your desired title
          font: {
            family: 'Arial, sans-serif',
            size: 24, // Customize font size
            color: '#000000' // Customize font color
          },
          x: 0.01, // Positioning the title horizontally (0 is left, 1 is right)
          xanchor: 'left', // Centers the title horizontally
          y: 0.95, // Adjust vertical position
          yanchor: 'top', // Aligns the title to the top
        },
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 30] // Adjust as needed
          },
          angularaxis: {
            rotation: 90, // Makes 0° at the top
            direction: 'clockwise' // Optional: to match compass-style direction
          }
        },
        showlegend: true
      }
    };
  }
  
}
