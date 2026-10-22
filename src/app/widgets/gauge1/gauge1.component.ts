import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-gauge1',
    imports: [NgxEchartsModule],
    standalone: true,
    templateUrl: './gauge1.component.html',
    styleUrl: './gauge1.component.css',
    providers: [
        {
            provide: NGX_ECHARTS_CONFIG,
            useValue: { echarts: () => import('echarts') }
        }
    ]
})
export class Gauge1Component implements OnInit, OnChanges {
  @Input() value: number | string = 0;
  @Input() min: number = 0;
  @Input() max: number = 3;

  gaugeOption: any;
  mergeOption: any;

  ngOnInit(): void {
    this.initGauge();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['min'] || changes['max']) {
      if (!this.gaugeOption) {
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

    this.gaugeOption = {
      animation: true,
      animationDuration: 800,
      animationDurationUpdate: 800,
      animationEasing: 'cubicOut',
      animationEasingUpdate: 'cubicOut',
      tooltip: {
        formatter: '{a} <br/>{b} : {c} m/s',
        textStyle: {
          fontSize: 14,
          color: '#333'
        }
      },
      series: [
        {
          name: 'Current Speed',
          type: 'gauge',
          radius: '90%',
          min: this.min,
          max: effectiveMax,
          splitNumber: 6,
          axisLine: {
            lineStyle: {
              width: 7,
              color: [
                [0.33, '#67e0e3'],
                [0.66, '#37a2da'],
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
            fontSize: 8,
            formatter: (v: number) => Number.isInteger(v) ? `${v}` : v.toFixed(1)
          },
          detail: {
            valueAnimation: true,
            show: false,
            formatter: '{value} m/s',
            color: '#000',
            fontSize: 12,
            offsetCenter: [0, '40%']
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
        }
      ]
    };
  }
}
