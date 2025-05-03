import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { singleAxis } from '../home.component';

@Component({
  selector: 'app-single-axis',
  imports: [NgxEchartsModule],
  templateUrl: './single-axis.component.html',
  styleUrl: './single-axis.component.css',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class SingleAxisComponent implements OnInit {
  @Input() singleAxis: singleAxis[] = [];
  option: any;
  xData: number[] = []; // Store timestamps for x-axis
  yData: number[] = []; // Store values for y-axis

  ngOnInit(): void {
    // Convert DateTime to timestamp and prepare data
    for (let index = 0; index < this.singleAxis.length; index++) {
      const dateTime = new Date(this.singleAxis[index].DateTime).getTime(); // Convert to timestamp
      const value = parseFloat(this.singleAxis[index].value)
      this.xData.push(dateTime); // Push timestamp to xData
      this.yData.push(value); // Push value to yData
    }

    console.log("xData (timestamps):", this.xData); // Debugging output
    console.log("yData:", this.yData); // Debugging output

    this.setChartOptions();
  }

  setChartOptions() {
    this.option = {
      title: {
        text: this.singleAxis[0]?.name || 'No Data'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${params[0].name}<br/>Value: ${params[0].value}`;
        }
      },
      xAxis: {
        type: 'time', // Time axis to handle date and time values
        data: this.xData, // Use the timestamp data for x-axis
        axisLabel: {
          formatter: (value: any) => {
            // Format the timestamp to a readable date-time format
            return echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', value);
          }
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: this.yData,
          type: 'line',
          smooth: true
        }
      ],
      dataZoom: [
        {
          type: 'inside', // Enables zooming and panning using mouse wheel, drag, or pinch
          xAxisIndex: [0], // Apply zoom to the x-axis
        },
        {
          type: 'slider', // Adds a slider to the chart for zoom control
          xAxisIndex: [0], // Apply zoom to the x-axis
          handleSize: '8%', // Size of the slider handles
        }
      ]
    };
  }
}
