import { Component } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { distance } from 'ol/coordinate';


@Component({
  selector: 'app-gauge2',
  standalone: true,
  imports: [NgxEchartsModule],  
  templateUrl: './gauge2.component.html',
  styleUrls: ['./gauge2.component.css'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class Gauge2Component {
  gaugeOption: any = {
    // backgroundColor: '#f4f4f4', // Background color
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
        radius: '90%', // Size of the gauge
        min: 0,
        max: 100,
        splitNumber: 10, // Number of ticks
        axisLine: {
          lineStyle: {
            width: 3, // Width of the axis line
            // color: [
            //   [0.3, '#ff4500'],  // Red for 0-30%
            //   [0.7, '#ffa500'],  // Orange for 30-70%
            //   [1, '#008000']    // Green for 70-100%
            // ]
          }
        },
        axisTick: {
          length: 10, 
          distance: 1,
          lineStyle: {
            color: '#000',
            width: 0.5
          }
        },
        splitLine: {
          length: 12,
          distance: 1,
          lineStyle: {
            color: '#000',
            width: 2
          }
        },
        axisLabel: {
          fontSize: 8,
          color: '#000',
          distance: 5
        },
        pointer: {
          length: '80%',
          width: 4,
          itemStyle: {
            color: 'blue'
          }
        },
        progress: {
          show: true,
          width: 3
        },
        // detail: {
        //   formatter: '{value} m/s',
        //   fontSize: 18,
        //   color: '#000',
         
        // },
        data: [
          {
            value: 50,
            color:'#000',
            show:false,
            // distance:20,
            // name: 'SCORE',
            title: {
              offsetCenter: [0, '70%'],
              fontSize: 12,
              color: '#000',
              show:false
            },
            detail: {
              offsetCenter: [0, '40%'],
              fontSize: 12,
              distance:-30,
              // fontWeight: 'bold',
              color: '#000',
              show:false

            }
          }
        ]
      }
    ]
  };
}
