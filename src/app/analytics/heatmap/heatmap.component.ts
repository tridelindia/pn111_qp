import { Component, OnInit } from '@angular/core';
import { time as echartTime } from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  standalone: true,
  selector: 'app-heatmap',
  imports: [NgxEchartsModule],
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent {

  chartOption: EChartsOption;

  constructor() {
    const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];
    const times: string[] = [];
    const now = new Date();

    // Generate time intervals (10-minute intervals over 24 hours = 144 points)
    for (let i = 0; i < 144; i++) {
      const time = new Date(now.getTime() - (143 - i) * 10 * 60 * 1000);
      const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      times.push(formattedTime);
    }

    // Generate dummy data: [time index, station index, temperature]
    const data: [number, number, number][] = [];
    for (let i = 0; i < stations.length; i++) {
      for (let j = 0; j < times.length; j++) {
        const temp = Math.random() * 10 + 20; // Range: 20°C to 30°C
        data.push([j, i, parseFloat(temp.toFixed(2))]);
      }
    }

    this.chartOption = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          return `Station: ${stations[params.value[1]]}<br/>Time: ${times[params.value[0]]}<br/>Temperature: ${params.value[2]}°C`;
        }
      },
      grid: {
        height: '70%',
        top: '10%',
        left: '5%',
        right: '5%'
      },
      xAxis: {
        type: 'category',
        data: times,
        splitArea: { show: true },
        axisLabel: {
          interval: 20,
          rotate: 45
        }
      },
      yAxis: {
        type: 'category',
        data: stations,
        splitArea: { show: true }
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          start: 0,
          end: 100
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          zoomOnMouseWheel: true,
          moveOnMouseWheel: true,
          moveOnMouseMove: true
        }
      ],
      visualMap: {
        min: 20,
        max: 30,
        calculable: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        inRange: {
          color: ['#00BFFF', '#87CEFA', '#FFD700', '#FF8C00', '#FF4500']
        },
        formatter: (
          value: string | number | Date | null | undefined | (string | number | Date | null | undefined)[],
          value2?: string | number | Date | null | undefined,
          index?: number
        ): string => {
          if (Array.isArray(value)) {
            return `${value[0]} °C – ${value[1]} °C`;
          } else if (typeof value === 'number') {
            return `${value} °C`;
          }
          return '';
        },
        seriesIndex: 0,
        dimension: 2,
        itemHeight: 150,
        itemWidth: 15,
        textStyle: {
          fontSize: 12
        }
      },          
      series: [
        {
          name: 'Water Temperature',
          type: 'heatmap' as const,
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              borderColor: '#000',
              borderWidth: 1
            }
          }
        }
      ]
    };
  }


  // chartOption: echarts.EChartsOption;

  // constructor() {
  //   const stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];
  //   const times: string[] = [];
  //   const now = new Date();

  //   // Generate time intervals (10-min intervals for 1 day = 144 points)
  //   for (let i = 0; i < 144; i++) {
  //     const time = new Date(now.getTime() - (143 - i) * 10 * 60 * 1000);
  //     times.push(`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`);
  //   }

  //   // Generate dummy data [time index, station index, temperature]
  //   const data: [number, number, number][] = [];
  //   for (let i = 0; i < stations.length; i++) {
  //     for (let j = 0; j < times.length; j++) {
  //       const temp = Math.random() * 10 + 20; // 20°C to 30°C
  //       data.push([j, i, parseFloat(temp.toFixed(2))]);
  //     }
  //   }

  //   this.chartOption = {
  //     tooltip: {
  //       position: 'top',
  //       formatter: (params: any) => {
  //         return `Station: ${stations[params.value[1]]}<br/>Time: ${times[params.value[0]]}<br/>Temperature: ${params.value[2]}°C`;
  //       }
  //     },
  //     grid: {
  //       height: '70%',
  //       top: '10%',
  //       left: '5%',
  //       right: '5%'
  //     },
  //     xAxis: {
  //       type: 'category',
  //       data: times,
  //       splitArea: { show: true },
  //       axisLabel: {
  //         interval: 20,
  //         rotate: 45
  //       }
  //     },
  //     yAxis: {
  //       type: 'category',
  //       data: stations,
  //       splitArea: { show: true }
  //     },
  //     dataZoom: [
  //       {
  //         type: 'slider',
  //         xAxisIndex: 0,
  //         start: 0,
  //         end: 100
  //       },
  //       {
  //         type: 'inside',
  //         xAxisIndex: 0,
  //         zoomOnMouseWheel: true,
  //         moveOnMouseWheel: true,
  //         moveOnMouseMove: true
  //       }
  //     ],
  //     visualMap: {
  //       min: 20,
  //       max: 30,
  //       calculable: true,
  //       orient: 'vertical',
  //       left: 'right',
  //       top: 'center',
  //       inRange: {
  //         color: ['#00BFFF', '#87CEFA', '#FFD700', '#FF8C00', '#FF4500']
  //       },
  //       formatter: function (value: any) {
  //         return `${value} °C`;
  //       },
  //       seriesIndex: 0,
  //       dimension: 2,
  //       itemHeight: 150,
  //       itemWidth: 15,
  //       textStyle: {
  //         fontSize: 12
  //       },
  //     },
  //     series: [
  //       {
  //         name: 'Water Temperature',
  //         type: 'heatmap',
  //         data: data,
  //         label: {
  //           show: false
  //         },
  //         emphasis: {
  //           itemStyle: {
  //             borderColor: '#000',
  //             borderWidth: 1
  //           }
  //         }
  //       }
  //     ]
  //   };
  // }
}