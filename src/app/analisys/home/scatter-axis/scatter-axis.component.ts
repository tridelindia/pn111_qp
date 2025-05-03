import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { ScatterAxis } from '../home.component';
@Component({
  selector: 'app-scatter-axis',
  imports: [NgxEchartsModule],
  templateUrl: './scatter-axis.component.html',
  styleUrl: './scatter-axis.component.css',
  providers:[
      {
        provide: NGX_ECHARTS_CONFIG,
        useValue: { echarts: () => import('echarts') }
    }
    ]
})
export class ScatterAxisComponent implements OnInit{
  option:any;
  @Input() scatterAxis:ScatterAxis[] = []

  axisData:[number, number][] = []
ngOnInit(): void {
    for (let index = 0; index < this.scatterAxis.length; index++) {
        this.axisData.push([
          parseFloat(this.scatterAxis[index].value1),
          parseFloat(this.scatterAxis[index].value2)
        ])
    }
    this.setChart()
    console.log("axisData", this.axisData)
}

  setChart(){
    this.option = {
      title:{
        text:"Scatter Plot"
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${params[0].name}<br/>Value: ${params[0].value}`;
        }
      },
      xAxis: {
        name:this.scatterAxis[0].name1,
        nameLocation:'middle',
        nameGap:30
      },
      yAxis: {
        name:this.scatterAxis[0].name2,
        nameLocation:'middle',
        nameGap:30
      },
      legend: {
        data: ['Sample Data'], // This name must match `series.name`
        top: 20,
        show:false
      },
      series: [
        {
          name: 'Sample Data', // Legend label
        type: 'scatter',
        symbolSize: 8,
        data: this.axisData,
        
        }
      ],
      dataZoom: [
        {
          type: 'inside', // Enables zooming and panning using mouse wheel, drag, or pinch
          xAxisIndex: [0], // Apply zoom to the x-axis
        },
        {
          type: 'slider', // Adds a slider to the chart for zoom control
          xAxisIndex: [0], // Apply zoom to the x-axis
          handleSize: '8%', // Size of the slider handles
        }
      ]
    };
  }
  
}
