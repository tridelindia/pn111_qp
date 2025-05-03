import { Component, Input } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-scatter',
  imports: [NgxEchartsModule],
  templateUrl: './scatter.component.html',
  styleUrl: './scatter.component.css',
  providers:[
      {
                  provide: NGX_ECHARTS_CONFIG,
                  useValue: { echarts: () => import('echarts') }
              }
    ]
})
export class ScatterComponent {
  @Input() id!:string;

  option = {
    legend: {
      data: ['Series 1', 'Series 2'],
      top: 'bottom'
    },
    xAxis: {
      type: 'time',
      name: 'Date',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: 'Value',
      nameLocation: 'middle',
      nameGap: 30
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: { seriesName: any; value: any[]; }) {
        return `
        <strong>Series:</strong> ${params.seriesName}<br/>
          <strong>Date:</strong> ${new Date(params.value[0]).toLocaleString()}<br/>
          <strong>Value:</strong> ${params.value[1]}
        `;
      }
    },
    series: [
      {
        name: 'Series 1',
        symbolSize: 20,
        type: 'scatter',
        data: [
          ['2025-12-12T12:12:00', -9],
          ['2025-11-12T12:12:00', 8]
        ]
      },
      {
        name: 'Series 2',
        symbolSize: 20,
        type: 'scatter',
        data: [
          ['2025-12-12T12:12:00', 4],
          ['2025-11-12T12:12:00', -3]
        ]
      }
    ]
  };
  
}
