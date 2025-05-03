import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-test-chart',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './test-chart.component.html',
  styleUrls: ['./test-chart.component.css'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class TestChartComponent implements OnInit {
  @Input() id!: string;
  @Input() plotType: string = 'line';
  @Input() length!: number;
  @Input() title!: string;
  @Input() params!: {
    param_name: string;
    values: { [key: string]: string[] };
    datetime: string[];
  };

  chartOption: any;
  series: any[] = [];

  ngOnInit(): void {
    this.generateSeries();
  }

  generateSeries(): void {
    this.series = [];
    const keys = Object.keys(this.params.values); // e.g., ['v1', 'v2']
    
    const legendNames = keys.map((k, i) => `Station ${i + 1}`);

    keys.forEach((key, index) => {
      const color = this.getColor(index);
      const valueArray = this.params.values[key];

      if (!valueArray || valueArray.length === 0) return;

      const data = this.params.datetime.map((dt, i) => ({
        value: [dt, +valueArray[i] || null]  // Ensure numeric or null
      }));

      this.series.push({
        name: legendNames[index],
        type: this.plotType,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        sampling: 'average',
        itemStyle: { color: color.base },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color.gradientStart },
            { offset: 1, color: color.gradientEnd }
          ])
        },
        data
      });
    });

    this.chartOption = {
      title: {
        text: this.params.param_name,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: 30,
        data: legendNames
      },
      toolbox: {
        feature: { saveAsImage: {} }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: {
        type: 'value'
      },
      series: this.series
    };
  }

  getColor(index: number) {
    const colors = [
      {
        base: '#0770FF',
        gradientStart: 'rgba(58,77,233,0.8)',
        gradientEnd: 'rgba(58,77,233,0.3)'
      },
      {
        base: '#F2597F',
        gradientStart: 'rgba(213,72,120,0.8)',
        gradientEnd: 'rgba(213,72,120,0.3)'
      },
      {
        base: '#00C49F',
        gradientStart: 'rgba(0,196,159,0.8)',
        gradientEnd: 'rgba(0,196,159,0.3)'
      }
    ];
    return colors[index % colors.length];
  }
}
