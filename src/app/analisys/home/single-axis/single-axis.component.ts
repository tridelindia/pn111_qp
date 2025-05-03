import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { singleAxis } from '../home.component';

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

  ngOnInit(): void {

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
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${echarts.format.formatTime('yyyy-MM-dd hh:mm:ss', params[0].value[0])}<br/>Value: ${params[0].value[1]}`;
        }
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: any) => {
            return echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', value);
          }
        }
      },
      yAxis: {
        type: 'value',
        name: this.singleAxis[0]?.name || '',
        nameLocation: 'middle',
        nameGap: 30
      },
      series: [
        {
          data: seriesData,
          type: this.plotType,
          smooth: true
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
          handleSize: '8%'
        }
      ]
    };
  }
  
}
