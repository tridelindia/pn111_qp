import { Component, Input, OnInit } from '@angular/core';
import { singleAxis } from '../analytics.component';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { AxisLabel } from '@amcharts/amcharts5/xy';
import { GlobalDataService } from '../../global-data/global-data.component';

@Component({
  selector: 'app-direction-chart',
  imports: [NgxEchartsModule],
  templateUrl: './direction-chart.component.html',
  styleUrl: './direction-chart.component.css',
  providers: [
      {
        provide: NGX_ECHARTS_CONFIG,
        useValue: { echarts: () => import('echarts') }
      }
    ]
})
export class DirectionChartComponent implements OnInit{
  @Input() singleAxis: singleAxis[] = [];
  unit!:string;
  @Input() plotType!:string;
  option: any;
  xData: number[] = []; // Store timestamps for x-axis
  yData: number[] = []; // Store values for y-axis
   arrowSvg = 'path://M0,-10 L5,0 L2,0 L2,10 L-2,10 L-2,0 L-5,0 Z';

constructor(private data:GlobalDataService){}
  ngOnInit(): void {
    const u = this.data.SensorConfigs.filter(item=> item.param_name === this.singleAxis[0].name);
    this.unit = u[0].unit
    const seriesData = this.singleAxis.map(item => [
      new Date(item.DateTime).getTime(),
      parseFloat(item.value)
    ]);
    
    

    console.log("seriesData:", this.unit); // Debug

    this.setChartOptions(seriesData as [number, number][]);
    // this.setChartOptions();

  }

  setChartOptions(seriesData: [number, number][]) {
    this.option = {
      title: {
        text: 'Single Axis Plot'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${echarts.format.formatTime('dd-MM-yyyy hh:mm:ss', params[0].value[0])}<br/>Direction: ${params[0].value[1]}°`;
        }
      },
      legend:{
        data:[`${this.singleAxis[0].name}`],
        // data: [`${this.MultiAxis[0].name1} Data`, `${this.MultiAxis[0].name2} Data`], // This name must match `series.name`
        top: 30,
        show:true
      },
      
      xAxis: {
        type: 'time',
        name:"Date Time",
        nameLocation:'middle',
        nameGap:45,
        axisLabel: {
          fontWeight:'bold',
          formatter: (value: any) => {
            return echarts.format.formatTime('dd-MM-yyyy\nhh:mm:ss', value);
          }
        }
      },
      yAxis: {
        type: 'value',
        name: `${this.singleAxis[0]?.name}  (${this.unit})` || 'Direction (°)',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel:{

          fontWeight:'bold'
        }
      },
      series: [
        {
          type: this.plotType, // usually 'line'
          data: seriesData,
          symbol: this.arrowSvg, // arrow-like
          symbolSize: 10,
          // Dynamically set symbol rotation for each point
          symbolRotate: (value: any) => value[1], // Rotate based on direction
          lineStyle: {
            color: '#5470C6',
            width: 2
          },
          itemStyle: {
            color: 'green'
          },
          label: {
            show: false,
            formatter: (params: any) => `${params.value[1]}°`,
            position: 'top'
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0]
        },
        {
          type: 'slider',
          xAxisIndex: [0],
          handleSize: '3%',
          bottom:15,
          height:20
        }
      ]
    };
  }
  
  
}
