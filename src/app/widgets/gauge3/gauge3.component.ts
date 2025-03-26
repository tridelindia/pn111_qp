import { Component } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import Background from 'three/src/renderers/common/Background.js';

@Component({
  selector: 'app-gauge3',
  imports: [NgxEchartsModule],
  standalone:true,
  templateUrl: './gauge3.component.html',
  styleUrl: './gauge3.component.css',
  providers: [
      {
        provide: NGX_ECHARTS_CONFIG,
        useValue: { echarts: () => import('echarts') }
      }
    ]
})
export class Gauge3Component {
  options:any= {
    // backgroundColor:'#000',
    series: [
    
      {
        backgroundcolor:'#000',
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 60,
        splitNumber: 12,
        itemStyle: {
          color: 'blue'
        },
        progress: {
          show: true,
          width: 3,
          
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 10
          }
        },
        axisTick: {
          distance: -20,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#999'
          }
        },
        splitLine: {
          distance: -20,
          length: 8,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          distance: -5,
          color: '#999',
          fontSize: 5
        },
        anchor: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 4,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 6,
          fontWeight: 'bolder',
          formatter: '{value} °C',
          color: 'inherit',
          show:false
        },
        data: [
          {
            value: 20,
            show:false
          }
        ]
      },
      {
        type: 'gauge',
        center: ['50%', '60%'],
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 60,
        itemStyle: {
          color: 'blue'
        },
        progress: {
          show: true,
          width: 8,
         
        },
        pointer: {
          show: true,
          width:3
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        detail: {
          show: false
        },
        data: [
          {
            value: 20,
            show:false
          }
        ]
      }
    ]
  }
}
