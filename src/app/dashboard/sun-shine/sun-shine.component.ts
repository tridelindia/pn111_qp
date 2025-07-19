import { Component, Input, OnInit } from '@angular/core';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';

interface SunshineData {
  date: string;
  sunshineHours: number;
  hourly: {
    [time: string]: number; // '06:00', '12:00', etc.
  };
}
@Component({
  selector: 'app-sun-shine',
  standalone: true,
  imports: [NgxEchartsModule],
  templateUrl: './sun-shine.component.html',
  styleUrl: './sun-shine.component.css',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class SunShineComponent implements OnInit {
  chartOption: any;
  @Input() sunshineData!: SunshineData[];
  ngOnInit(): void {
    const times = ['06:00', '12:00', '18:00'];
    const xAxisLabels: string[] = [];
    const dataPoints: number[] = [];
    const markPointData: any[] = [];
    this.sunshineData.forEach(entry => {
      const day = entry.date; // MM-DD
      times.forEach(time => {
        const [year, month, date] = entry.date.split('-'); // Assuming "YYYY-MM-DD"
const label = `${date}-${month} (${time})`;
        xAxisLabels.push(label);
        dataPoints.push(entry.hourly[time] ?? 0);
        // Add sun/moon markers
        if (time === '06:00') {
          markPointData.push({ coord: [label, entry.hourly[time]], symbol: 'image://assets/image/moon.png' });
        }
        if (time === '12:00') {
          markPointData.push({ coord: [label, entry.hourly[time]], symbol: 'image://assets/image/sun.png' });
        }
      });
    });
    this.chartOption = {
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: xAxisLabels,
    axisLabel: {
      rotate: 45,
      fontSize:10
    }
  },
  yAxis: {
    type: 'value'
  },
  visualMap: {
    show: false,
    dimension: 0,
    pieces: xAxisLabels.map((label, index) => {
      const time = label.split(' ')[1];
      if (time === '12:00') {
        return { gt: index - 0.5, lte: index + 0.5, color: '#fff3e0' }; // light orange (day)
      } else {
        return { gt: index - 0.5, lte: index + 0.5, color: '#f5f5f5' }; // light gray (night)
      }
    })
  },
  series: [
  {
    name: 'Radiation',
    type: 'line',
    smooth: true,
    data: dataPoints,
    lineStyle: {
      color: 'orange'
    },
    itemStyle: {
      color: 'orange'
    },
    areaStyle: {
      color: 'rgba(255, 165, 0, 0.1)'
    },
    markPoint: {
      symbolSize: 40,
      data: markPointData
    },
    markArea: {
      silent: true,
      itemStyle: {
        opacity: 0.3
      },
      data: xAxisLabels.map((label, index) => {
        const time = label.split(' ')[1];
        const color = time === '12:00' ? '#ffe6bf' : '#dbd9d9'; // light orange or light gray
        return [{
          name: time === '12:00' ? 'D' : 'N',
          xAxis: label,
          itemStyle: {
            color: color,
            fontSize:12
          }
        }, {
          xAxis: xAxisLabels[index + 1] || label
        }];
      })
    }
  }
]

};

  }
}