import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateRange, ChartData } from '../../models/dashboard.models';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartModule } from 'primeng/chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';

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
    legend: { 
      data: [],
      orient: 'horizontal',
      top: 'middle'
    },
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
      min: function(value: any) {
        return Math.floor(value.min * 0.9);
      },
      max: 100,
      interval: 8,
      splitNumber: 4,
      axisLabel: { 
        color: '#6b7280',
        formatter: function(value: number) {
          return Math.round(value);
        }
      },
      splitLine: { 
        lineStyle: { color: '#f3f4f6' },
        show: true
      }
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
      legend: { 
        data: series.map(s => s.name),
        orient: 'horizontal',
        right: 10,
      },
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
    // Register the datalabels plugin
    Chart.register(ChartDataLabels);
    this.initChartOptions();
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const grayColor  = '#E0E0E0';
    
    if (!this.chartHealthData) {
      this.chartHealthData = {
        labels: ['Oceanography', 'Meteorology', 'Water Quality'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B'
          ],
          borderColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B'
          ],
          borderWidth: 2,
          label: 'Data Health'
        }]
      };
    }

    this.chartHealthOptions = {
      plugins: {
        legend: {
          display: true,
          position: 'top',
          orient: 'horizontal',
          top: 'middle'
        },
        datalabels: {
          display: false
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: grayColor,
            circular: true,
            lineWidth: 2
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
    // Calculate averages for main categories
    const oceanographyScore = (tabScores.wave + tabScores.current) / 2;
    const meteorologyScore = (tabScores.wind + tabScores.atmospheric) / 2;
    const waterQualityScore = (tabScores.chemical + tabScores.physical + tabScores.biological) / 3;

    this.chartHealthData = {
      labels: ['Oceanography', 'Meteorology', 'Water Quality'],
      datasets: [{
        data: [
          Math.round(oceanographyScore || 0),
          Math.round(meteorologyScore || 0),
          Math.round(waterQualityScore || 0)
        ],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B'
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B'
        ],
        borderWidth: 2,
        label: 'Data Health'
      }]
    };
  }
}