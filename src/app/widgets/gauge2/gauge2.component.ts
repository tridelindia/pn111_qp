import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

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
export class Gauge2Component implements OnInit, OnChanges {
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
              width: 3
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
            distance: 5,
            formatter: (v: number) => Number.isInteger(v) ? `${v}` : v.toFixed(1)
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
          data: [
            {
              value: val,
              color: '#000',
              show: false,
              title: {
                show: false
              },
              detail: {
                show: false
              }
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
              value: val
            }
          ]
        }
      ]
    };
  }
}
