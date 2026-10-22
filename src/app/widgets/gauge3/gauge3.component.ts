import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-gauge3',
    imports: [NgxEchartsModule],
    standalone: true,
    templateUrl: './gauge3.component.html',
    styleUrl: './gauge3.component.css',
    providers: [
        {
            provide: NGX_ECHARTS_CONFIG,
            useValue: { echarts: () => import('echarts') }
        }
    ]
})
export class Gauge3Component implements OnInit, OnChanges {
  @Input() value: number | string = 0;
  @Input() min: number = 0;
  @Input() max: number = 3;

  options: any;
  mergeOption: any;

  ngOnInit(): void {
    this.initGauge();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['min'] || changes['max']) {
      if (!this.options) {
        this.initGauge();
      } else {
        this.updateGauge();
      }
    }
  }

  private getEffectiveMax(): number {
    const val = Number(this.value) || 0;
    const base = this.max || 3;
    return val > base ? Math.ceil(val) : base;
  }

  private initGauge(): void {
    const val = Number(this.value) || 0;
    const effectiveMax = this.getEffectiveMax();

    this.options = {
      animation: true,
      animationDuration: 800,
      animationDurationUpdate: 800,
      animationEasing: 'cubicOut',
      animationEasingUpdate: 'cubicOut',
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          startAngle: 200,
          endAngle: -20,
          min: this.min,
          max: effectiveMax,
          splitNumber: 6,
          itemStyle: {
            color: '#1e88e5'
          },
          progress: {
            show: true,
            width: 3
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
            fontSize: 8,
            formatter: (v: number) => Number.isInteger(v) ? `${v}` : v.toFixed(1)
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
            fontSize: 9,
            fontWeight: 'bolder',
            formatter: '{value} m/s',
            color: 'inherit',
            show: false
          },
          data: [
            {
              value: val,
              show: false
            }
          ]
        },
        {
          type: 'gauge',
          center: ['50%', '60%'],
          startAngle: 200,
          endAngle: -20,
          min: this.min,
          max: effectiveMax,
          itemStyle: {
            color: '#1e88e5'
          },
          progress: {
            show: true,
            width: 8
          },
          pointer: {
            show: true,
            width: 3
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
              value: val,
              show: false
            }
          ]
        }
      ]
    };
  }

  private updateGauge(): void {
    const val = Number(this.value) || 0;
    const effectiveMax = this.getEffectiveMax();

    this.mergeOption = {
      series: [
        {
          min: this.min,
          max: effectiveMax,
          data: [
            {
              value: val,
              show: false
            }
          ]
        },
        {
          min: this.min,
          max: effectiveMax,
          data: [
            {
              value: val,
              show: false
            }
          ]
        }
      ]
    };
  }
}
