import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { singleAxis } from '../home.component';
import { Legend } from '@amcharts/amcharts5';
import { AxisLabel } from '@amcharts/amcharts5/xy';
import { GlobalDataService } from '../../../global-data/global-data.component';

@Component({
  selector: 'app-single-axis',
  imports: [NgxEchartsModule],
  templateUrl: './single-axis.component.html',
  styleUrl: './single-axis.component.css',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class SingleAxisComponent implements OnInit {
  @Input() singleAxis: singleAxis[] = [];
  @Input() plotType!:string;
  option: any;
  xData: number[] = []; // Store timestamps for x-axis
  yData: number[] = []; // Store values for y-axis
  unit:string='';
  constructor(private data:GlobalDataService){}
  ngOnInit(): void {
    // const u = this.data.SensorConfigs.filter(item=> item.param_name === this.singleAxis[0].name);
    // this.unit = u[0].unit
    const seriesData = this.singleAxis.map(item => [
      new Date(item.DateTime).getTime(),
      parseFloat(item.value)
    ]);

    console.log("seriesData:", seriesData); // Debug

    this.setChartOptions(seriesData as [number, number][]);
    // this.setChartOptions();
  }

  setChartOptions(seriesData: [number, number][]) {
    this.option = {
      title: {
        text: 'Single Axis Plot'
      },
      legend: {
        data:[`${this.singleAxis[0].name}`],
              // data: [`${this.MultiAxis[0].name1} Data`, `${this.MultiAxis[0].name2} Data`], // This name must match `series.name`
              top: 30,
              show:true
            },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${echarts.format.formatTime('dd-MM-yyyy hh:mm:ss', params[0].value[0])}<br/>Value: ${params[0].value[1]}`;
        }
      },
      xAxis: {
        type: 'time',
        name:"Date Time",
        nameGap:45,
        nameLocation: 'middle',
        axisLabel: {
          // fontSize: 18,
    fontWeight: 'bold',
          formatter: (value: any) => {
            return echarts.format.formatTime('dd-MM-yyyy\nhh:mm:ss', value);
          }
        }
      },
      yAxis: {
        type: 'value',
        name: `${this.singleAxis[0]?.name} (${this.unit})` || '',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel:{
        fontWeight: 'bold',
        }
      },
      series: [
        {
          data: seriesData,
          type: this.plotType,
          smooth: true,
          fontWeight: 'bold',
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
