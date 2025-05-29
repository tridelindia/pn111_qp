import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { ScatterAxis } from '../home.component';
import { GlobalDataService } from '../../../global-data/global-data.component';
@Component({
  selector: 'app-scatter-axis',
  imports: [NgxEchartsModule],
  templateUrl: './scatter-axis.component.html',
  styleUrl: './scatter-axis.component.css',
  providers:[
      {
        provide: NGX_ECHARTS_CONFIG,
        useValue: { echarts: () => import('echarts') }
    }
    ]
})
export class ScatterAxisComponent implements OnInit{
  option:any;
  @Input() scatterAxis:ScatterAxis[] = []

  axisData:[number, number][] = []
  unitx:string='';
  unitY:string='';
constructor(private data:GlobalDataService){}
  ngOnInit(): void {
    const u = this.data.SensorConfigs.filter(item=> item.param_name === this.scatterAxis[0].name1);
    this.unitx = u[0].unit
    const u1 = this.data.SensorConfigs.filter(item=> item.param_name === this.scatterAxis[0].name2);
    this.unitY = u1[0].unit
    for (let index = 0; index < this.scatterAxis.length; index++) {
        this.axisData.push([
          parseFloat(this.scatterAxis[index].value1),
          parseFloat(this.scatterAxis[index].value2)
        ])
    }
    this.setChart()
    console.log("axisData", this.axisData)
}

  setChart(){
    const legendName = `${this.scatterAxis[0].name1} - ${this.scatterAxis[0].name2}`;

    this.option = {
      title:{
        text:"Scatter Plot"
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${params[0].name}<br/>Value: ${params[0].value}`;
        }
      },
      xAxis: {
        name:`${this.scatterAxis[0].name1} (${this.unitx})`,
        nameLocation:'middle',
        nameGap:40,
         axisLabel:{
          fontWeight:'bold'
        }
      },
      yAxis: {
        name:`${this.scatterAxis[0].name2} (${this.unitY})`,
        nameLocation:'middle',
        nameGap:30,
         axisLabel:{
          fontWeight:'bold'
        }
      },
      legend: {
        data: [legendName], // This name must match `series.name`
        top: 20,
        show:true
      },
      series: [
        {
          name: 'Sample Data', // Legend label
        type: 'scatter',
        symbolSize: 8,
        data: this.axisData,
        
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
