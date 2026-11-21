import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

export interface SunshineData {
  day: string;
  date: string;
  sunshineHours: number;
}

@Component({
  selector: 'app-sun-shine',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './sun-shine.component.html',
  styleUrl: './sun-shine.component.css',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class SunShineComponent implements OnInit, OnChanges {
  chartOption: any;
  echartsInstance: any;
  @Input() sunshineData: SunshineData[] = [];

  ngOnInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sunshineData']) {
      this.buildChart();
      setTimeout(() => {
        if (this.echartsInstance) {
          this.echartsInstance.resize();
        }
      }, 50);
    }
  }

  onChartInit(ec: any): void {
    this.echartsInstance = ec;
    setTimeout(() => {
      if (this.echartsInstance) {
        this.echartsInstance.resize();
      }
    }, 50);
  }

  private buildChart(): void {
    const days = (this.sunshineData || []).map(entry => entry.day);
    const hours = (this.sunshineData || []).map(entry => entry.sunshineHours);

    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          if (!params || !params.length) return '';
          const item = params[0];
          const entry = this.sunshineData ? this.sunshineData[item.dataIndex] : null;
          const dateStr = entry?.date ? ` (${entry.date})` : '';
          return `<strong>${item.name}${dateStr}</strong><br/>Peak Sunshine: <strong>${item.value} hrs</strong>`;
        }
      },
      grid: {
        top: 25,
        right: 15,
        bottom: 25,
        left: 35,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: days,
        axisTick: { alignWithLabel: true },
        axisLine: {
          lineStyle: { color: '#ccc' }
        },
        axisLabel: {
          color: '#555',
          fontSize: 11,
          fontWeight: 500
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        name: 'Hours',
        nameTextStyle: {
          color: '#777',
          fontSize: 10,
          padding: [0, 0, 0, 5]
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        },
        axisLabel: {
          color: '#777',
          fontSize: 10,
          formatter: '{value}h'
        }
      },
      series: [
        {
          name: 'Peak Sunshine Hours',
          type: 'bar',
          barWidth: '40%',
          data: hours,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#fbbf24' }
              ]
            }
          },
          emphasis: {
            itemStyle: {
              color: '#d97706'
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => params.value > 0 ? `${params.value}h` : '',
            fontSize: 10,
            color: '#b45309',
            fontWeight: 'bold'
          }
        }
      ]
    };
  }
}
