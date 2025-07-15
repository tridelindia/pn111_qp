import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainChartSectionComponent } from './data-chart/data-chart.component';
import { DateRange, ChartData } from '../models/dashboard.models';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { SensorTabComponent } from './sensor-tab/sensor-tab.component';
import { DataLossChartComponent } from './data-loss-chart/data-loss-chart.component';
import { SensorStatsComponent } from './sensor-stats/sensor-stats.component';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, delay } from 'rxjs/operators';
import { SensorStatusComponent } from './sensor-status/sensor-status.component';
import { environment } from '../../environments/environment';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-data-health',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    MainChartSectionComponent,
    NgxEchartsModule,
    SensorTabComponent,
    DataLossChartComponent,
    SensorStatsComponent,
    SensorStatusComponent
  ],
  templateUrl: './data-health.component.html',
  styleUrl: './data-health.component.css',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
})
export class DataHealthComponent implements OnInit {
  private apiUrl = 'http://localhost:3000/api/';
  private updateSubject = new Subject<void>();
  private rawData: any[] = [];

  private readonly PARAM_COUNTS = {
    oceanography: { total: 17, wave: 15, current: 2 },
    meteorology: { total: 9, wind: 3, atmospheric: 6 },
    waterQuality: { total: 12, chemical: 3, physical: 5, biological: 4 }
  };

  isFiltering = false;

  xAxisData: string[] = [];
  chartData: ChartData = {
    oceanography: [],
    meteorology: [],
    waterQuality: [],
    dates: []
  };

  dateRange = {
    from: new Date(new Date().setDate(new Date().getDate() - 1)),
    to: new Date()
  };

  apiData: any = null;
  loading = false;
  currentSensor = '';
  selectedTabs: string[] = [];
  selectedStation: string = '';
  hasMeteorology = false;

  constructor(
    private http: HttpClient,
    private layout:LayoutComponent
  ) {
    this.updateSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    const station_Id =this.layout.selectedStationId;
    this.hasMeteorology = this.layout.sensors.includes('meteorology');
    this.onStationSelected(station_Id);
  }

  onDateRangeChange(newRange: { from: Date | null; to: Date | null }): void {
    if (newRange.from && newRange.to) {
      if (newRange.from !== this.dateRange.from || newRange.to !== this.dateRange.to) {
        this.dateRange = { from: newRange.from, to: newRange.to };
        this.loadChartData();
      }
    }
  }

  onUpdate(): void {
    this.updateSubject.next();
  }

  onStationSelected(stationId: string) {
    this.selectedStation = stationId;
    this.loadChartData();
  }

  private loadChartData(): void {
    const formatForDB = (date: Date) => {
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const url = `${environment.apiUrl}/getHealthData`;
    const params = {
      station_id: this.selectedStation,
      startDate: formatForDB(this.dateRange.from),
      endDate: formatForDB(this.dateRange.to)
    };

    this.loading = true;
    this.resetChartData();
    
    this.http.get(url, { params }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.rawData = response.data;
          this.apiData = response;
          this.applyFilters();
        } else {
          console.log('Invalid API response, resetting chart');
          this.resetChartData();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.resetChartData();
        this.loading = false;
      }
    });
  }

  private calculateTabScores(data: any[]): any {
    if (!data || data.length === 0) return {
      wave: 0,
      current: 0,
      wind: 0,
      atmospheric: 0,
      chemical: 0,
      physical: 0,
      biological: 0
    };

    const lastDataPoint = data[data.length - 1];
    const dataPresent = lastDataPoint.dataPresent;

    return {
      wave: this.calculateScore(dataPresent, 'oceanography.wave', 15),
      current: this.calculateScore(dataPresent, 'oceanography.current', 2),
      wind: this.calculateScore(dataPresent, 'meteorology.wind', 3),
      atmospheric: this.calculateScore(dataPresent, 'meteorology.atmospheric', 6),
      chemical: this.calculateScore(dataPresent, 'waterQuality.chemical', 3),
      physical: this.calculateScore(dataPresent, 'waterQuality.physical', 5),
      biological: this.calculateScore(dataPresent, 'waterQuality.biological', 4)
    };
  }

  private calculateScore(dataPresent: any, prefix: string, totalParams: number): number {
    const params = Object.entries(dataPresent)
      .filter(([key]) => key.startsWith(prefix))
      .filter(([_, value]) => value === 1);
    return (params.length / totalParams) * 100;
  }

  private applyFilters(): void {
    if (!this.rawData) return;
    
    this.isFiltering = true;
    setTimeout(() => {
      const filteredData = this.filterDataBySelectedTabs(this.rawData);
      console.log('filteredData:', filteredData);
      this.processChartData(filteredData);
      this.isFiltering = false;
    });
  }

  private filterDataBySelectedTabs(data: any[]): any[] {
    if (!this.selectedTabs || this.selectedTabs.length === 0) {
      return data;
    }

    return data.map(item => {
      const filteredDataPresent = Object.fromEntries(
        Object.entries(item.dataPresent).filter(([key]) => {
          return this.selectedTabs.some(tabId => {
            const parts = key.split('.');
            return parts[parts.length - 1] === tabId;
          });
        })
      );

      return {
        ...item,
        dataPresent: filteredDataPresent
      };
    });
  }

  private calculateSensorScores(data: any[], prefix: string, totalParams: number): number[] {
    return data.map(item => {
      const params = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith(prefix))
        .filter(([_, value]) => value === 1);
      return (params.length / totalParams) * 100;
    });
  }

  private processChartData(data: any[]): void {
    if (!data || !Array.isArray(data)) {
      console.log('Invalid data received, resetting chart');
      this.resetChartData();
      return;
    }
    const validData = data.filter(item => 
      item && 
      item.datetime && 
      item.dataPresent
    );
    if(validData.length === 0){
      console.log('No valid data points found, resetting chart');
      this.resetChartData();
      return;
    }

    const dates = validData.map(item => item.datetime);
    this.xAxisData = dates.map(date => 
      new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const waveScores = validData.map(item => {
      const waveParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('oceanography.wave'))
        .filter(([_, value]) => value === 1);
      return (waveParams.length / 15) * 100;
    });

    const currentScores = validData.map(item => {
      const currentParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('oceanography.current'))
        .filter(([_, value]) => value === 1);
      return (currentParams.length / 2) * 100;
    });

    const windScores = validData.map(item => {
      const windParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('meteorology.wind'))
        .filter(([_, value]) => value === 1);
      return (windParams.length / 3) * 100;
    });

    const atmosphericScores = validData.map(item => {
      const atmosphericParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('meteorology.atmospheric'))
        .filter(([_, value]) => value === 1);
      return (atmosphericParams.length / 6) * 100;
    });

    const chemicalScores = validData.map(item => {
      const chemicalParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('water_quality.chemical'))
        .filter(([_, value]) => value === 1);
      return (chemicalParams.length / 3) * 100;
    });

    const physicalScores = validData.map(item => {
      const physicalParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('water_quality.physical'))
        .filter(([_, value]) => value === 1);
      return (physicalParams.length / 5) * 100;
    });

    const biologicalScores = validData.map(item => {
      const biologicalParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('water_quality.biological'))
        .filter(([_, value]) => value === 1);
      return (biologicalParams.length / 4) * 100;
    });

    const oceanographyScores = validData.map(item => {
      const oceanographyParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('oceanography'))
        .filter(([_, value]) => value === 1);
      return (oceanographyParams.length / 17) * 100;
    });

    const meteorologyScores = validData.map(item => {
      const meteorologyParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('meteorology'))
        .filter(([_, value]) => value === 1);
      return (meteorologyParams.length / 9) * 100;
    });

    const waterQualityScores = validData.map(item => {
      const waterQualityParams = Object.entries(item.dataPresent)
        .filter(([key]) => key.startsWith('water_quality'))
        .filter(([_, value]) => value === 1);
      return (waterQualityParams.length / 12) * 100;
    });

    const overallScore = this.calculateOverallHealthScore(
      oceanographyScores,
      meteorologyScores,
      waterQualityScores
    );

    this.chartData = {
      oceanography: oceanographyScores,
      meteorology: meteorologyScores,
      waterQuality: waterQualityScores,
      dates: dates
    };

    this.apiData = {
      ...this.apiData,
      overallScore: overallScore,
      tabScores: {
        wave: this.calculateAverageScore(waveScores),
        current: this.calculateAverageScore(currentScores),
        wind: this.calculateAverageScore(windScores),
        atmospheric: this.calculateAverageScore(atmosphericScores),
        chemical: this.calculateAverageScore(chemicalScores),
        physical: this.calculateAverageScore(physicalScores),
        biological: this.calculateAverageScore(biologicalScores)
      }
    };
  }

  private calculateAverageScore(scores: number[]): number {
    if (!scores || scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  private calculateOverallHealthScore(
    oceanographyScores: number[],
    meteorologyScores: number[],
    waterQualityScores: number[]
  ): number {
    const avgOceanography = oceanographyScores.reduce((a, b) => a + b, 0) / oceanographyScores.length;
    const avgMeteorology = meteorologyScores.reduce((a, b) => a + b, 0) / meteorologyScores.length;
    const avgWaterQuality = waterQualityScores.reduce((a, b) => a + b, 0) / waterQualityScores.length;

    const totalParams = 17 + 9 + 12;
    const weightedScore = (
      (avgOceanography * 17) + 
      (avgMeteorology * 9) + 
      (avgWaterQuality * 12)
    ) / totalParams;

    return Math.round(weightedScore * 100) / 100;
  }

  private getParametersForCurrentSensor(): { category: string, key: string }[] {
    if (!this.currentSensor) {
        return [
            { category: 'oceanography', key: 'oceanography.wave.1' },
            { category: 'meteorology', key: 'meteorology.wind.17' },
            { category: 'waterQuality', key: 'water_quality.biological.35' }
        ];
    }

    switch(this.currentSensor) {
        case 'oceanography':
            return [
                { category: 'oceanography', key: 'oceanography.wave.1' },
                { category: 'oceanography', key: 'oceanography.wave.5' }
            ];
        case 'meteorology':
            return [
                { category: 'meteorology', key: 'meteorology.wind.17' },
                { category: 'meteorology', key: 'meteorology.wind.18' }
            ];
        case 'water_quality':
            return [
                { category: 'waterQuality', key: 'water_quality.biological.35' },
                { category: 'waterQuality', key: 'water_quality.physical.31' }
            ];
        default:
            return [];
    }
  }

  private resetChartData(): void {
    this.chartData = {
      oceanography: [],
      meteorology: [],
      waterQuality: [],
      dates: []
    };
    this.xAxisData = [];
  }

  onSensorSelected(sensorId: string) {
    this.currentSensor = sensorId;
    this.selectedTabs = [];
  }

  onTabUpdate(data: {sensor: string, tab: string}) {
    this.selectedTabs = data.tab ? data.tab.split(',').filter(tab => tab !== '') : [];
    this.applyFilters();
  }
}