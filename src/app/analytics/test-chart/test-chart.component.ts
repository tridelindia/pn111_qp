import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import dayjs from 'dayjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import groupBy from 'lodash/groupBy';
import { GlobalDataService } from '../../global-data/global-data.component';
import { min } from 'lodash';

interface Station {
  stationId: string;
  name: string;
}
@Component({
  selector: 'app-test-chart',
  standalone: true,
  imports: [NgxEchartsModule, CommonModule, FormsModule],
  templateUrl: './test-chart.component.html',
  styleUrls: ['./test-chart.component.css'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') },
    },
  ],
})
export class TestChartComponent implements OnInit, OnChanges {
  @Input() id!: string;
  @Input() plotType: string = 'line';
  @Input() length!: number;
  @Input() title!: string;
  @Input() stations: Station[] = [];
  @Input() selectedStation!: string[];
  @Input() params!: {
    param_name: string;
    values: { [key: string]: string[] };
    datetime: string[];
  };
  @Input() aggregationMode: 'date' | 'week' | 'month' | 'year' = 'date';

  @Input() showMean: boolean = false;
  chartOption: any;
  series: any[] = [];
  names: string[] = [];

  constructor(private data: GlobalDataService) {}

  ngOnInit(): void {
    console.log('sensorrrrr config', this.data.SensorConfigs);
    this.generateSeries();
    console.log(this.selectedStation);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['showMean'] ||
      changes['params'] ||
      changes['selectedStation'] ||
      changes['aggregationMode'] ||
      changes['plotType']
    ) {
      // Regenerate series whenever key inputs change
      this.generateSeries();
    }
  }

  toggleMean() {
    this.generateSeries();
  }

  generateSeries(): void {
    this.names = this.selectedStation.map((id) => {
      const match = this.stations.find((station) => station.stationId === id);
      return match ? match.name : '';
    });
    this.series = [];
    const keys = Object.keys(this.params.values); // e.g., ['v1', 'v2']

    const legendNames = this.names;

    // Resolve thresholds for current parameter from global SensorConfigs
    const normalizedParam = (this.params?.param_name || '').toLowerCase();
    const thresholds = this.getThresholdsForParam(normalizedParam);

    keys.forEach((key, index) => {
      const color = this.getColor(index);
      const valueArray = this.params.values[key];

      if (!valueArray || valueArray.length === 0) return;

      let data: { value: [string, number | null] }[] = this.params.datetime.map(
        (dt, i) => ({
          value: [dt, +valueArray[i] || null] as [string, number | null],
        })
      );

      if (this.showMean) {
        data = this.aggregateData(data);
      }

      console.log('comapre', data);
      this.series.push({
        name: legendNames[index],
        type: this.plotType,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        sampling: 'average',
        itemStyle: { color: color.base },
        // areaStyle: {
        //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        //     { offset: 0, color: color.gradientStart },
        //     { offset: 1, color: color.gradientEnd }
        //   ])
        // },
        data,
      });
    });

    const thresholdLegend: string[] = [];
    const thresholdSeries: any[] = [];

    if (thresholds.qns_min != null) {
      thresholdLegend.push('Qatar Standards Lower');
      thresholdSeries.push({
        name: 'Qatar Standards Lower',
        type: 'line',
        data: this.params.datetime.map((dt) => [
          dt,
          thresholds.qns_min as number,
        ]),
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: 'red' },
        lineStyle: { color: 'red', type: 'dashed' },
      });
    }
    if (thresholds.qns_max != null) {
      thresholdLegend.push('Qatar Standards Upper');
      thresholdSeries.push({
        name: 'Qatar Standards Upper',
        type: 'line',
        data: this.params.datetime.map((dt) => [
          dt,
          thresholds.qns_max as number,
        ]),
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: 'red' },
        lineStyle: { color: 'red', type: 'dashed' },
      });
    }
    if (thresholds.lusail_max != null) {
      thresholdLegend.push('Lusail Permit Upper');
      thresholdSeries.push({
        name: 'Lusail Permit Upper',
        type: 'line',
        data: this.params.datetime.map((dt) => [
          dt,
          thresholds.lusail_max as number,
        ]),
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: 'purple' },
        lineStyle: { color: 'purple', type: 'dashed' },
      });
    }
    if (thresholds.lusail_min != null) {
      thresholdLegend.push('Lusail Permit Lower');
      thresholdSeries.push({
        name: 'Lusail Permit Lower',
        type: 'line',
        data: this.params.datetime.map((dt) => [
          dt,
          thresholds.lusail_min as number,
        ]),
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: 'purple' },
        lineStyle: { color: 'purple', type: 'dashed' },
      });
    }

    this.chartOption = {
      title: {
        text: this.params.param_name,
        left: 'left',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        top: 30,
        data: [...legendNames, ...thresholdLegend],
      },
      toolbox: {
        feature: { saveAsImage: {} },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0],
        },
        {
          type: 'slider',
          xAxisIndex: [0],
          handleSize: '8%',
        },
      ],
      yAxis: {
        type: 'value',
        min: 'dataMin',
        max: 'dataMax',
      },
      series: [...this.series, ...thresholdSeries],
    };
  }

  getColor(index: number) {
    const colors = [
      {
        base: '#0770FF',
        gradientStart: 'rgba(58,77,233,0.8)',
        gradientEnd: 'rgba(58,77,233,0.3)',
      },
      {
        base: '#F2597F',
        gradientStart: 'rgba(213,72,120,0.8)',
        gradientEnd: 'rgba(213,72,120,0.3)',
      },
      {
        base: '#00C49F',
        gradientStart: 'rgba(0,196,159,0.8)',
        gradientEnd: 'rgba(0,196,159,0.3)',
      },
      {
        base: 'rgba(243, 226, 94, 0.8)',
        gradientStart: 'rgba(243, 226, 94, 0.8)',
        gradientEnd: 'rgba(6, 223, 183, 0.3)',
      },
      {
        base: 'rgba(200, 69, 223, 0.8)',
        gradientStart: 'rgba(200, 69, 223, 0.8)',
        gradientEnd: 'rgba(138, 159, 155, 0.3)',
      },
    ];
    return colors[index % colors.length];
  }

  aggregateData(data: { value: (string | number | null)[] }[]) {
    let grouped: { [key: string]: typeof data } = {};

    if (this.aggregationMode === 'week') {
      grouped = groupBy(data, (d) =>
        dayjs(d.value[0]).startOf('week').format('YYYY-[W]WW')
      );
    } else if (this.aggregationMode === 'month') {
      grouped = groupBy(data, (d) =>
        dayjs(d.value[0]).startOf('month').format('YYYY-MM')
      );
    } else if (this.aggregationMode === 'year') {
      grouped = groupBy(data, (d) =>
        dayjs(d.value[0]).startOf('year').format('YYYY')
      );
    } else {
      // default: day
      grouped = groupBy(data, (d) =>
        dayjs(d.value[0]).startOf('day').format('YYYY-MM-DD')
      );
    }

    return Object.keys(grouped).map((k) => {
      const group = grouped[k];
      const avg =
        group.reduce((sum, d) => sum + ((d.value[1] as number) ?? 0), 0) /
        group.length;

      // keep correct key type (time string + avg)
      return { value: [k, avg] as [string, number] };
    });
  }

  private getThresholdsForParam(paramLower: string): {
    qns_min: number | null;
    qns_max: number | null;
    lusail_max: number | null;
    lusail_min: number | null;
  } {
    const cfg: any = (this.data.SensorConfigs || []).find(
      (c: any) => (c?.param_name || '').toLowerCase() === paramLower
    );
    const parseNum = (v: any): number | null => {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? (n as number) : null;
    };
    return {
      qns_min: parseNum(cfg?.qns_min),
      qns_max: parseNum(cfg?.qns_max),
      lusail_max: parseNum(cfg?.lusail_max),
      lusail_min: parseNum(cfg?.lusail_min),
    };
  }
}
