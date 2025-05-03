import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { MultiAxis } from '../home.component';
@Component({
  selector: 'app-multi-axis',
  imports: [NgxEchartsModule],
  standalone:true,
  templateUrl: './multi-axis.component.html',
  styleUrl: './multi-axis.component.css',
  providers:[
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class MultiAxisComponent implements OnInit{
  option:any;
  @Input() MultiAxis:MultiAxis[] = [];

xAxisData:number[] = [];
yAxisData: number[] = [];
Dates:string[] = []
  ngOnInit(): void {
      for (let index = 0; index < this.MultiAxis.length; index++) {
        const date = new Date(this.MultiAxis[index].timestamps).getTime();
        this.xAxisData.push(parseFloat(this.MultiAxis[index].value1))
        this.yAxisData.push(parseFloat(this.MultiAxis[index].value2));
        this.Dates.push(date.toString());
      }
      this.setChart()
  }
  setChart(){
    this.option = {
      title: {
        text: 'Dual Y-Axis Plot'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${params[0].name}<br/>Value: ${params[0].value}`;
        }

      },
      xAxis: {
        type: 'time',
        name:'DateTime',
        data: this.Dates,
        nameGap:30,
        nameLocation:'middle'
      },
      legend: {
        data: ['Sample Data', 'sampleData2'], // This name must match `series.name`
        top: 20,
        show:false
      },
      yAxis: [
        {
          type: 'value',
          name: this.MultiAxis[0].name2,
          nameLocation:'middle',
          nameGap:40
        },
        {
          type: 'value',
          name: this.MultiAxis[0].name1,
          nameLocation:'middle',
          nameGap:40,
          position: 'right', // Place second Y-axis on the right
          offset: 0 // Optional: adjust if needed
        }
      ],
      series: [
        {
          name: `${this.MultiAxis[0].name2} Data`,
          data: this.xAxisData,
          type: 'line',
          smooth: true,
          yAxisIndex: 0 ,// Uses first Y-axis (default),
          // label: {
          //   show: true,           // Show label
          //   position: 'left'       // 'top', 'bottom', 'left', 'right', etc.
          // }
        },
        {
          name: `${this.MultiAxis[0].name1} Data`,
          
          data: this.yAxisData,
          type: 'line',
          yAxisIndex: 1, // Uses second Y-axis
          // lable:{
          //   show:true,
          //   position:'right'
          // }
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
