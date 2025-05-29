import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { MultiAxis } from '../home.component';
import { GlobalDataService } from '../../../global-data/global-data.component';
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
  @Input() plotType!:string;

xAxisData:number[] = [];
yAxisData: number[] = [];
Dates:string[] = [];
unitx:string='';
unitY:string='';
constructor(private data:GlobalDataService){}
  ngOnInit(): void {
    const u = this.data.SensorConfigs.filter(item=> item.param_name === this.MultiAxis[0].name1);
    this.unitx = u[0].unit
    const u1 = this.data.SensorConfigs.filter(item=> item.param_name === this.MultiAxis[0].name2);
    this.unitY = u1[0].unit
      // for (let index = 0; index < this.MultiAxis.length; index++) {
      //   const date = new Date(this.MultiAxis[index].timestamps).getTime();
      //   this.xAxisData.push(parseFloat(this.MultiAxis[index].value1))
      //   this.yAxisData.push(parseFloat(this.MultiAxis[index].value2));
      //   this.Dates.push(date.toString());
      // }

      const series1 = this.MultiAxis.map(item => [
        new Date(item.timestamps).getTime(),
        parseInt(item.value1)
      ]);
    
      const series2 = this.MultiAxis.map(item => [
        new Date(item.timestamps).getTime(),
        parseInt(item.value2)
      ]);
    
      console.log("Series1:", series1);
      console.log("Series2:", series2);
    
      this.setChart(series1 as [number, number][], series2 as [number, number][]);
      // this.setChart()
  }
  setChart(series1: [number, number][], series2: [number, number][]){
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
        nameGap:40,
        nameLocation:'middle',
        axisLabel:{
          fontWeight:'bold'
        }
      },
      legend: {
        data: [`${this.MultiAxis[0].name1} Data`, `${this.MultiAxis[0].name2} Data`], // This name must match `series.name`
        top: 30,
        show:true
      },
      yAxis: [
        {
          type: 'value',
          name: `${this.MultiAxis[0].name2} (${this.unitY})`,
          nameLocation:'middle',
          nameGap: 40,
          position: 'left',
          axisLabel:{

          fontWeight:'bold'
        },
          axisLine: {
            show: true
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: true
          }
        },
        {
          type: 'value',
          name: `${this.MultiAxis[0].name1} (${this.unitx})`,
          nameLocation:'middle',
          nameGap: 40,
          position: 'right',
          axisLabel:{

          fontWeight:'bold'
        },
          axisLine: {
            show: true
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: false // Optional: to reduce clutter
          }
        }
      ],
      
      series: [
        {
          name: `${this.MultiAxis[0].name2} Data`,
          data: series1,
          type: this.plotType,
          smooth: true,
          yAxisIndex: 0 ,// Uses first Y-axis (default),
          // label: {
          //   show: true,           // Show label
          //   position: 'left'       // 'top', 'bottom', 'left', 'right', etc.
          // }
        },
        {
          name: `${this.MultiAxis[0].name1} Data`,
          
          data: series2,
          type: this.plotType,
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
