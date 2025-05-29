import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { DateRange, ChartData } from '../../models/dashboard.models';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartModule } from 'primeng/chart';
import { LayoutComponent } from '../../layout/layout.component';

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
  station_Id: string;

  waveChartOptions: any = {
    tooltip: { 
      trigger: 'axis',
      formatter: function(params: any) {
        if (!params || !params[0]) return '';
        const date = new Date(params[0].axisValue);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        let result = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}<br/>`;
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
    grid: { left: '4%', right: '2%', bottom: '1%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      // name: 'Date & Time',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLabel: { 
        color: '#6b7280', 
        // rotate: 30,
        formatter: (value: string) => {
          if (!value) return '';
          const date = new Date(value);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');
          return `${day}-${month}-${year} \n${hours}:${minutes}:${seconds}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Score (%)',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 'bold'
      },
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
    const shouldShowMeteorology = this.station_Id !== 'ST001' && this.station_Id !== 'ST002';
    
    if (!this.currentSensor) {
      series.push(
        this.createSeries('Oceanography', '#3B82F6', this.chartData?.oceanography || []),
        ...(shouldShowMeteorology ? [this.createSeries('Meteorology', '#10B981', this.chartData?.meteorology || [])] : []),
        this.createSeries('Water Quality', '#F59E0B', this.chartData?.waterQuality || [])
      );
    } else {
      switch(this.currentSensor) {
        case 'oceanography':
          series.push(this.createSeries('Oceanography', '#3B82F6', this.chartData?.oceanography || []));
          break;
        case 'meteorology':
          if (shouldShowMeteorology) {
            series.push(this.createSeries('Meteorology', '#10B981', this.chartData?.meteorology || []));
          }
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

  constructor(
    private layout:LayoutComponent
  ) {
    this.initChartOptions();
    this.station_Id = this.layout.selectedStationId;
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
          display: false,
          backgroundColor: 'transparent',
          z: 1,
          stepSize: 20,
          color: textColor,
          font: {
            size: 12
          }
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
          ticks: {
            display: true,
            backdropColor: 'transparent',
            showLabelBackdrop: false,
            z: 1,
            stepSize: 20,
            color: textColor,
            font: {
              size: 12
            }
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

    const shouldShowMeteorology = this.station_Id !== 'ST001' && this.station_Id !== 'ST002';
    
    const labels = ['Oceanography', ...(shouldShowMeteorology ? ['Meteorology'] : []), 'Water Quality'];
    const data = [
      Math.round(oceanographyScore || 0),
      ...(shouldShowMeteorology ? [Math.round(meteorologyScore || 0)] : []),
      Math.round(waterQualityScore || 0)
    ];
    const colors = [
      '#3B82F6',
      ...(shouldShowMeteorology ? ['#10B981'] : []),
      '#F59E0B'
    ];

    this.chartHealthData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        label: 'Data Health'
      }]
    };
  }
}