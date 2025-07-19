import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

interface Station{
  stationId: string; name: string;
}
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
  @Input() stations:Station[]=[]
  @Input() selectedStation!:string[];
  @Input() params!: {
    param_name: string;
    values: { [key: string]: string[] };
    datetime: string[];
  };

  chartOption: any;
  series: any[] = [];

  ngOnInit(): void {
    this.generateSeries();
    console.log(this.selectedStation);
  }
names:string[]=[];
  generateSeries(): void {
  this.names = this.selectedStation.map(id => {
  const match = this.stations.find(station => station.stationId === id);
  return match ? match.name : '';
});
    this.series = [];
    const keys = Object.keys(this.params.values); // e.g., ['v1', 'v2']
    
    const legendNames = this.names;

    keys.forEach((key, index) => {
      const color = this.getColor(index);
      const valueArray = this.params.values[key];

      if (!valueArray || valueArray.length === 0) return;

      const data = this.params.datetime.map((dt, i) => ({
        value: [dt, +valueArray[i] || null]  // Ensure numeric or null
      }));

      console.log("comapre", data)
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
        data
      });
    });

    this.chartOption = {
      title: {
        text: this.params.param_name,
        left: 'left'
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
       dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0]
        },
        {
          type: 'slider',
          xAxisIndex: [0],
          handleSize: '8%'
        }
      ],
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
      },{
        base: 'rgba(243, 226, 94, 0.8)',
        gradientStart: 'rgba(243, 226, 94, 0.8)',
        gradientEnd: 'rgba(6, 223, 183, 0.3)'
      },{
        base: 'rgba(200, 69, 223, 0.8)',
        gradientStart: 'rgba(200, 69, 223, 0.8)',
        gradientEnd: 'rgba(138, 159, 155, 0.3)'
      }
    ];
    return colors[index % colors.length];
  }
}
