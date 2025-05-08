import { Component } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-line-chart',
  imports: [NgxEchartsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css'
})
export class LineChartComponent {

  chartOption: any;
  timestamps = ['10:00', '10:10', '10:20', '10:30'];
  stations = ['Station A', 'Station B', 'Station C', 'Station D', 'Station E'];

  rawData = [
    [0, 0, 25.6], [0, 1, 26.2], [0, 2, 28.4], [0, 3, 30.1], [0, 4, 27.8],
    [1, 0, 26.0], [1, 1, 27.1], [1, 2, 29.5], [1, 3, 31.0], [1, 4, 28.2],
    [2, 0, 24.8], [2, 1, 26.5], [2, 2, 28.9], [2, 3, 30.5], [2, 4, 27.5],
    [3, 0, 23.9], [3, 1, 25.2], [3, 2, 27.3], [3, 3, 29.8], [3, 4, 26.7]
  ];

  ngOnInit() {
    this.chartOption = {
      title: {
        text: 'Temperature Trends by Station',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: 30,
        data: this.stations
      },
      xAxis: {
        type: 'category',
        name: 'Time',
        data: this.timestamps,
        boundaryGap: false,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: 'Temperature (°C)'
      },
      visualMap: {
        show: false,
        dimension: 2,
        seriesIndex: [0, 1, 2, 3, 4],
        pieces: [
          { gt: 29, color: '#FF4500' },
          { gt: 27, lte: 29, color: '#FF8C00' },
          { gt: 25, lte: 27, color: '#FFD700' },
          { gt: 22, lte: 25, color: '#87CEFA' },
          { lte: 22, color: '#00BFFF' },
        ]
      },
      series: this.stations.map((station, stationIdx) => ({
        name: station,
        type: 'line',
        data: this.timestamps.map((_, timeIdx) => {
          const temp = this.rawData.find(d => d[0] === timeIdx && d[1] === stationIdx)?.[2] ?? 0;
          return [timeIdx, temp, temp];
        }),
        encode: {
          x: 0,
          y: 1,
          tooltip: [1, 2]
        },
        showSymbol: false,
        lineStyle: {
          width: 3
        }
      }))
    };
  }
  
}
