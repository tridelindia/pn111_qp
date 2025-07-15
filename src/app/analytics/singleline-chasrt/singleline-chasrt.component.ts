import { Component, input, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'app-singleline-chasrt',
  imports: [NgxEchartsModule],
  templateUrl: './singleline-chasrt.component.html',
  styleUrl: './singleline-chasrt.component.css',
  providers:[
      {
                  provide: NGX_ECHARTS_CONFIG,
                  useValue: { echarts: () => import('echarts') }
              }
    ]
})
export class SinglelineChasrtComponent {

@Input() id!:string;
@Input() param_name!:string;
 

option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true
      }
    ]
  };
}
