import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-home-v1-chart',
  standalone: true,
  templateUrl: './home-v1-chart.component.html',
  styleUrls: ['./home-v1-chart.component.css'],
})
export class HomeV1ChartComponent implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  private initChart(): void {
    const chartElement = this.elementRef.nativeElement.querySelector('#chart');
    const myChart = echarts.init(chartElement);

    let dataAxis = [];
    let data = [];
    let today = new Date();
    for (let i = 0; i < 30; i++) {
      let date = new Date();
      date.setDate(today.getDate() - i);
      let formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      dataAxis.unshift(formattedDate);
      data.unshift(Math.floor(Math.random() * 81));
    }

    let yMax = 80;
    let dataShadow = Array(data.length).fill(yMax);

    const option = {
      title: {
        text: 'Data Recieved Time Chart',
        // subtext: 'Demonstrating ECharts Features',
      },
      xAxis: {
        data: dataAxis,
        axisLabel: { inside: false, color: '#000' },
        axisTick: { show: false },
        axisLine: { show: true },
        z: 10,
      },
      yAxis: {
        axisLine: { show: true },
        axisTick: { show: false },
        axisLabel: { color: '#999' },
        max: yMax,
      },
      dataZoom: [{ type: 'inside' }],
      series: [
        {
          type: 'bar',
          showBackground: true,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' },
              ]),
            },
          },
          data: data,
        },
      ],
    };

    myChart.setOption(option);

    // Enable data zoom on click
    const zoomSize = 7;
    myChart.on('click', function (params) {
      myChart.dispatchAction({
        type: 'dataZoom',
        startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
        endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)],
      });
    });
  }
}