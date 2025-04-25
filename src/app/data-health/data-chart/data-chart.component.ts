import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateRange, ChartData } from '../../models/dashboard.models';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-main-chart-section',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, ChartModule],
  templateUrl: './data-chart.component.html',
  styleUrls: ['./data-chart.component.css']
})
export class MainChartSectionComponent implements OnChanges, OnDestroy  {
  @Input() dateRange!: DateRange;
  @Input() overallScore: number = 0;
  @Input() chartData?: ChartData;
  @Input() currentSensor: string | null = null;
  @Input() xAxisData: string[] = [];
  @Input() set apiData(value: any) {
    if (value && value.tabScores) {
      this.updateHealthChartData(value.tabScores);
    }
  }

  private chartInstance: any;
  private isInitialized = false;

  waveChartOptions: any = {
    tooltip: { 
      trigger: 'axis',
      formatter: function(params: any) {
        let result = params[0].axisValue + '<br/>';
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${Math.round(param.value)}%<br/>`;
        });
        return result;
      }
    },
    legend: { data: [] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLabel: { 
        color: '#6b7280', 
        rotate: 30,
        formatter: (value: string) => {
          return value.length > 10 ? value.substring(0, 10) + '...' : value;
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        color: '#6b7280',
        formatter: function(value: number) {
          return Math.round(value);
        }
      },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: []
  };

  get normalizedScore(): number {
    return Math.min(Math.max(this.overallScore, 0), 100);
  }

  get progressValue(): number {
    return this.normalizedScore;
  }

  get progressColor(): string {
    if (this.normalizedScore >= 80) return '#10B981';
    if (this.normalizedScore >= 50) return '#F59E0B';
    return '#EF4444';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    this.isInitialized = false;
  }

  onChartInit(ec: any) {    
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    
    this.chartInstance = ec;
    this.isInitialized = true;
    
    if (this.chartData) {
      this.initChartOptions();
      this.chartInstance.setOption(this.waveChartOptions, true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized || !this.chartInstance) {
      return;
    }

    if (changes['chartData'] || changes['currentSensor'] || changes['xAxisData'] || changes['dateRange']) {
      this.initChartOptions();
      this.chartInstance.setOption(this.waveChartOptions, true);
    }

    if (changes['apiData']) {
      this.initChart();
    }
  }

  private initChartOptions(): void {
    const series = [];
    
    if (!this.currentSensor) {
      series.push(
        this.createSeries('Oceanography', '#3B82F6', this.chartData?.oceanography || []),
        this.createSeries('Meteorology', '#10B981', this.chartData?.meteorology || []),
        this.createSeries('Water Quality', '#F59E0B', this.chartData?.waterQuality || [])
      );
    } else {
      switch(this.currentSensor) {
        case 'oceanography':
          series.push(this.createSeries('Oceanography', '#3B82F6', this.chartData?.oceanography || []));
          break;
        case 'meteorology':
          series.push(this.createSeries('Meteorology', '#10B981', this.chartData?.meteorology || []));
          break;
        case 'water_quality':
          series.push(this.createSeries('Water Quality', '#F59E0B', this.chartData?.waterQuality || []));
          break;
      }
    }

    this.waveChartOptions = {
      ...this.waveChartOptions,
      legend: { data: series.map(s => s.name) },
      xAxis: {
        ...this.waveChartOptions.xAxis,
        data: this.xAxisData.length ? this.xAxisData : ['No data available']
      },
      series: series
    };
  }

  private createSeries(name: string, color: string, data: number[]): any {
    return {
      name,
      type: 'line',
      smooth: true,
      lineStyle: { width: 2, color },
      showSymbol: false,
      areaStyle: { opacity: 0.3, color },
      data: data.length ? data.map(value => Math.round(value)) : [0]
    };
  }

  updateChartData(newData: any): void {
    this.chartData = newData;
    this.initChartOptions();
  }

  getHealthStatusClass(): string {
    if (this.normalizedScore >= 80) return 'status-good';
    if (this.normalizedScore >= 50) return 'status-warning';
    return 'status-critical';
  }

  getHealthStatusIcon(): string {
    if (this.normalizedScore >= 80) return '✓';
    if (this.normalizedScore >= 50) return '⚠';
    return '✗';
  }

  chartHealthData: any;
  chartHealthOptions: any;

  constructor() {
    this.initChartOptions();
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const grayColor  = '#E0E0E0';
    
    if (!this.chartHealthData) {
      this.chartHealthData = {
        labels: ['Wave', 'Current', 'Wind', 'Atmospheric', 'Chemical', 'Physical', 'Biological'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#26C6DA',
            '#EC407A',
            '#7E57C2',
            '#8D6E63'
          ],
          borderColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#26C6DA',
            '#EC407A',
            '#7E57C2',
            '#8D6E63'
          ],
          borderWidth: 2,
          label: 'Data Health'
        }]
      };
    }

    this.chartHealthOptions = {
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `${context.label}: ${Math.round(context.raw)}%`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: textColor,
            backdropColor: 'transparent',
            callback: function(value: number) {
              return Math.round(value);
            }
          },
          grid: {
            color: grayColor,
            circular: true,
            lineWidth: 1
          },
          angleLines: {
            color: grayColor,
            lineWidth: 1
          },
          pointLabels: {
            color: textColor,
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        }
      },
      elements: {
        arc: {
          borderWidth: 2
        }
      }
    };
  }

  private updateHealthChartData(tabScores: any) {
    this.chartHealthData = {
      labels: ['Wave', 'Current', 'Wind', 'Atmospheric', 'Chemical', 'Physical', 'Biological'],
      datasets: [{
        data: [
          Math.round(tabScores.wave || 0),
          Math.round(tabScores.current || 0),
          Math.round(tabScores.wind || 0),
          Math.round(tabScores.atmospheric || 0),
          Math.round(tabScores.chemical || 0),
          Math.round(tabScores.physical || 0),
          Math.round(tabScores.biological || 0)
        ],
        backgroundColor: [
          '#42A5F5',
          '#66BB6A',
          '#FFA726',
          '#26C6DA',
          '#EC407A',
          '#7E57C2',
          '#8D6E63'
        ],
        borderColor: [
          '#42A5F5',
          '#66BB6A',
          '#FFA726',
          '#26C6DA',
          '#EC407A',
          '#7E57C2',
          '#8D6E63'
        ],
        borderWidth: 2,
        label: 'Data Health'
      }]
    };
  }
}