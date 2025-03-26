import { Component } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-gauge1',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './gauge1.component.html',
  styleUrl: './gauge1.component.css',
  providers: [
      {
        provide: NGX_ECHARTS_CONFIG,
        useValue: { echarts: () => import('echarts') }
      }
    ]
})
export class Gauge1Component {
   gaugeOption:any = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
      textStyle: {
        fontSize: 14,
        color: '#333'
      }
    },
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 7,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        pointer: {
          length: '80%',
          width: 4,
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -7,
          length: 5,
          lineStyle: {
            color: '#fff',
            width: 1
          }
        },
        splitLine: {
          distance: -7,
          length: 7,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: 'inherit',
          distance: 10,
          fontSize: 8
        },
        detail: {
          valueAnimation: true,
          show:false,
          formatter: '{value}%',
          color: '#000',
          fontSize: 12,
          offsetCenter: [0, '40%']
        },
        data: [
          {
            value: 80,
            show:false
          }
        ]
      }
    ]
  };
}
