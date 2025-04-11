import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ChartData } from '../../models/dashboard.models';

@Component({
  selector: 'app-data-loss-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './data-loss-chart.component.html',
  styleUrl: './data-loss-chart.component.css'
})
export class DataLossChartComponent implements OnInit, OnChanges {
  @Input() currentSensor: string | null = null;
  @Input() chartData?: ChartData;

  data: any = {
    labels: [],
    datasets: []
  };
  options: any;

  ngOnInit() {
    this.initChart();
  }

  ngOnChanges() {
    this.updateChartData();
  }

  private initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += `${context.raw}%`;
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 50,
          ticks: {
            color: textColor,
            stepSize: 10,
            callback: (value: any) => `${value}%`
          },
          grid: {
            color: surfaceBorder
          },
          title: {
            display: true,
            text: 'Data Loss Percentage',
            color: textColor
          }
        },
        y: {
          ticks: {
            color: textColor
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit'
    });
  }

  private convertToMissingPercentage(data: any[]): any[] {
    return data.map(value => {
      const availablePercentage = Number(value);
      const missingPercentage = 100 - availablePercentage;
      return Math.round(missingPercentage * 100) / 100;
    });
  }

  private updateChartData() {
    const newDatasets = [];
    const dates: string[] = [];

    if (this.chartData?.dates) {
      dates.push(...this.chartData.dates.map(date => this.formatDate(date)));
    }

    if (!this.currentSensor) {
      if (this.chartData?.oceanography) {
        newDatasets.push({
          label: 'Oceanography Data Loss',
          data: this.convertToMissingPercentage(this.chartData.oceanography),
          backgroundColor: '#3B82F6',
          borderColor: '#3B82F6',
          borderWidth: 1
        });
      }
      if (this.chartData?.meteorology) {
        newDatasets.push({
          label: 'Meteorology Data Loss',
          data: this.convertToMissingPercentage(this.chartData.meteorology),
          backgroundColor: '#10B981',
          borderColor: '#10B981',
          borderWidth: 1
        });
      }
      if (this.chartData?.waterQuality) {
        newDatasets.push({
          label: 'Water Quality Data Loss',
          data: this.convertToMissingPercentage(this.chartData.waterQuality),
          backgroundColor: '#F59E0B',
          borderColor: '#F59E0B',
          borderWidth: 1
        });
      }
    } else {
      switch (this.currentSensor) {
        case 'oceanography':
          if (this.chartData?.oceanography) {
            newDatasets.push({
              label: 'Oceanography Data Loss',
              data: this.convertToMissingPercentage(this.chartData.oceanography),
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              borderWidth: 1
            });
          }
          break;
        case 'meteorology':
          if (this.chartData?.meteorology) {
            newDatasets.push({
              label: 'Meteorology Data Loss',
              data: this.convertToMissingPercentage(this.chartData.meteorology),
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              borderWidth: 1
            });
          }
          break;
        case 'waterQuality':
        case 'water_quality':
          if (this.chartData?.waterQuality) {
            newDatasets.push({
              label: 'Water Quality Data Loss',
              data: this.convertToMissingPercentage(this.chartData.waterQuality),
              backgroundColor: '#F59E0B',
              borderColor: '#F59E0B',
              borderWidth: 1
            });
          }
          break;
      }
    }

    this.data = {
      labels: dates,
      datasets: newDatasets
    };
  }
}