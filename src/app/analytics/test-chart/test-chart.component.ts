import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-test-chart',
  imports:[NgxEchartsModule],
  templateUrl: './test-chart.component.html',
  styleUrls: ['./test-chart.component.css'],
  providers:[
    {
                provide: NGX_ECHARTS_CONFIG,
                useValue: { echarts: () => import('echarts') }
            }
  ]
})
export class TestChartComponent implements OnInit {
  chartOption: any;

  ngOnInit(): void {
    let base = +new Date(2016, 9, 3);
    let oneDay = 24 * 3600 * 1000;
    let valueBase = Math.random() * 300;
    let valueBase2 = Math.random() * 50;
    let data: any[] = [];
    let data2: any[] = [];

    for (let i = 1; i < 10; i++) {
      let now = new Date((base += oneDay));
      let dayStr = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-');

      valueBase = Math.round((Math.random() - 0.5) * 20 + valueBase);
      if (valueBase <= 0) valueBase = Math.random() * 300;
      data.push([dayStr, valueBase]);

      valueBase2 = Math.round((Math.random() - 0.5) * 20 + valueBase2);
      if (valueBase2 <= 0) valueBase2 = Math.random() * 50;
      data2.push([dayStr, valueBase2]);
    }

    this.chartOption = {
      title: {
        left: 'center',
        text: 'Tooltip and dataZoom on Mobile Device'
      },
      legend: {
        top: 'bottom',
        data: ['Intention']
      },
      tooltip: {
        triggerOn: 'none',
        position: function (pt: any) {
          return [pt[0], 130];
        }
      },
      toolbox: {
        left: 'center',
        itemSize: 25,
        top: 55,
        feature: {
          dataZoom: { yAxisIndex: 'none' },
          restore: {}
        }
      },
      xAxis: {
        type: 'time',
        axisPointer: {
          value: '2016-10-7',
          snap: true,
          lineStyle: {
            color: '#7581BD',
            width: 2
          },
          label: {
            show: true,
            formatter: function (params: any) {
              return echarts.format.formatTime('yyyy-MM-dd', params.value);
            },
            backgroundColor: '#7581BD'
          },
          handle: {
            show: true,
            color: '#7581BD'
          }
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisTick: { inside: true },
        splitLine: { show: false },
        axisLabel: {
          inside: true,
          formatter: '{value}\n'
        },
        z: 10
      },
      grid: {
        top: 110,
        left: 15,
        right: 15,
        height: 160
      },
      dataZoom: [{ type: 'inside', throttle: 50 }],
      series: [
        {
          name: 'Fake Data 1',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: '#0770FF'
          },
          stack: 'a',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(58,77,233,0.8)' },
              { offset: 1, color: 'rgba(58,77,233,0.3)' }
            ])
          },
          data: data
        },
        {
          name: 'Fake Data 2',
          type: 'line',
          smooth: true,
          stack: 'a',
          symbol: 'circle',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: '#F2597F'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(213,72,120,0.8)' },
              { offset: 1, color: 'rgba(213,72,120,0.3)' }
            ])
          },
          data: data2
        }
      ]
    };
  }
}
