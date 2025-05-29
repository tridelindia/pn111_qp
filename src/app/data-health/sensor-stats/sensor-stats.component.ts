import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../layout/layout.component';

type StatusType = 'satisfactory' | 'marginal' | 'unsatisfactory';

interface SensorStat {
  name: string;
  average: number;
  percentage: number;
  status: StatusType;
  tabId?: string;
}

type SortDirection = 'asc' | 'desc' | '';
type SortKey = keyof SensorStat;

@Component({
  selector: 'app-sensor-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sensor-stats.component.html',
  styleUrls: ['./sensor-stats.component.scss']
})
export class SensorStatsComponent implements OnChanges {
  @Input() activeSensor: string = 'sensor1';
  @Input() selectedTabs: string[] = [];
  @Input() apiData: any = null;
  station_Id: string;
  searchTerm: string = '';
  sortKey: SortKey | null = null;
  sortDirection: SortDirection = '';
  hasMeteorology = false;

  stats: SensorStat[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiData'] && this.apiData) {
      this.updateStatsFromApiData();
    }
  }

  constructor(
    private layout:LayoutComponent
  ) { 
    this.station_Id = this.layout.selectedStationId;
    this.hasMeteorology = this.layout.sensors.includes('meteorology');
  }

  private updateStatsFromApiData(): void {
    if (!this.apiData || !this.apiData.data || !this.apiData.data.length) {
      this.stats = [];
      return;
    }

    const parameterMapping: { [key: string]: { name: string; tabId: string } } = {
      'oceanography.wave.0': { name: 'Wave Heading', tabId: '0' },
      'oceanography.wave.1': { name: 'Significant Wave Height (Hs)', tabId: '1' },
      'oceanography.wave.2': { name: 'Zero Crossing Period (Tzc)', tabId: '2' },
      'oceanography.wave.3': { name: 'Mean Zero Crossing Period (Tz)', tabId: '3' },
      'oceanography.wave.4': { name: 'Mean Wave Period (Tm02)', tabId: '4' },
      'oceanography.wave.5': { name: 'Wave Direction', tabId: '5' },
      'oceanography.wave.6': { name: 'Wave Direction (FW)', tabId: '6' },
      'oceanography.wave.7': { name: 'Mean Wave Direction', tabId: '7' },
      'oceanography.wave.8': { name: 'Maximum Wave Height (Hmax)', tabId: '8' },
      'oceanography.wave.9': { name: 'Fourier Coeff. A1', tabId: '9' },
      'oceanography.wave.10': { name: 'Fourier Coeff. A2', tabId: '10' },
      'oceanography.wave.11': { name: 'Fourier Coeff. B1', tabId: '11' },
      'oceanography.wave.12': { name: 'Fourier Coeff. B2', tabId: '12' },
      'oceanography.wave.13': { name: 'Dominant Period (FW)', tabId: '13' },
      'oceanography.wave.14': { name: 'Average Wave Height (Havg)', tabId: '14' },
      'oceanography.current.15': { name: 'Current Direction (Bin 1)', tabId: '15' },
      'oceanography.current.16': { name: 'Current Speed (Bin 1)', tabId: '16' },
      'meteorology.wind.17': { name: 'Wind Speed', tabId: '17' },
      'meteorology.wind.18': { name: 'Wind Direction (deg)', tabId: '18' },
      'meteorology.wind.19': { name: 'Wind Gust', tabId: '19' },
      'meteorology.atmospheric.20': { name: 'Air Temperature (°C)', tabId: '20' },
      'meteorology.atmospheric.21': { name: 'Relative Humidity (%)', tabId: '21' },
      'meteorology.atmospheric.22': { name: 'Barometric Pressure (hPa)', tabId: '22' },
      'meteorology.atmospheric.23': { name: 'Rainfall (mm)', tabId: '23' },
      'meteorology.atmospheric.24': { name: 'Visibility', tabId: '24' },
      'meteorology.atmospheric.25': { name: 'Global Radiation', tabId: '25' },
      'water_quality.chemical.26': { name: 'PAH', tabId: '26' },
      'water_quality.chemical.27': { name: 'Oil in Water', tabId: '27' },
      'water_quality.chemical.28': { name: 'BT', tabId: '28' },
      'water_quality.physical.29': { name: 'Turbidity', tabId: '29' },
      'water_quality.physical.30': { name: 'Conductivity', tabId: '30' },
      'water_quality.physical.31': { name: 'Dissolved Oxygen', tabId: '31' },
      'water_quality.physical.32': { name: 'pH', tabId: '32' },
      'water_quality.physical.33': { name: 'Salinity', tabId: '33' },
      'water_quality.biological.34': { name: 'Chlorophyll-a', tabId: '34' },
      'water_quality.biological.35': { name: 'Water Temperature (°C)', tabId: '35' },
      'water_quality.biological.36': { name: 'Phycoerythrin', tabId: '36' },
      'water_quality.biological.37': { name: 'Fluorescein Dye', tabId: '37' }
    };

    const latestData = this.apiData.data[this.apiData.data.length - 1];
    if (!latestData || !latestData.dataPresent) {
      this.stats = [];
      return;
    }

    this.stats = Object.entries(latestData.dataPresent)
      .filter(([key]) => {
        if (!this.hasMeteorology && (key.startsWith('meteorology.wind.') || key.startsWith('meteorology.atmospheric.'))) {
          return false;
        }
        return parameterMapping[key];
      })
      .map(([key, value]) => {
        const mapping = parameterMapping[key];
        const average = this.calculateAverage(key);
        const percentage = average * 100;
        return {
          name: mapping.name,
          average: average,
          percentage: percentage,
          status: this.getStatusFromPercentage(percentage),
          tabId: mapping.tabId
        };
      });
  }

  private calculateAverage(key: string): number {
    if (!this.apiData || !this.apiData.data) return 0;

    const values = this.apiData.data
      .map((item: any) => item.dataPresent[key])
      .filter((value: any) => value !== undefined && value !== null);

    if (values.length === 0) return 0;

    const sum = values.reduce((acc: number, val: number) => acc + val, 0);
    return Number((sum / values.length).toFixed(2));
  }

  private getStatusFromPercentage(percentage: number): StatusType {
    if (percentage >= 90) return 'satisfactory';
    if (percentage >= 70) return 'marginal';
    return 'unsatisfactory';
  }

  get filteredStats(): SensorStat[] {
    let filtered = this.stats;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(stat => 
        stat.name.toLowerCase().includes(term) ||
        stat.status.toLowerCase().includes(term)
      );
    }

    if (this.sortKey && this.sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[this.sortKey!] as number | string;
        const bValue = b[this.sortKey!] as number | string;
        
        if (this.sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }

  onSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 
                          this.sortDirection === 'desc' ? '' : 'asc';
      if (this.sortDirection === '') {
        this.sortKey = null;
      }
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(key: SortKey): string {
    if (this.sortKey !== key) return '↕';
    return this.sortDirection === 'asc' ? '↑' : 
           this.sortDirection === 'desc' ? '↓' : '↕';
  }

  getStatusClass(status: StatusType): string {
    const statusClasses: Record<StatusType, string> = {
      'satisfactory': 'bg-green-100 text-green-800',
      'marginal': 'bg-yellow-100 text-yellow-800',
      'unsatisfactory': 'bg-red-100 text-red-800'
    };
    return statusClasses[status];
  }

  getStatusIcon(status: StatusType): string {
    const statusIcons: Record<StatusType, string> = {
      'satisfactory': '✓',
      'marginal': '⚠',
      'unsatisfactory': '✗'
    };
    return statusIcons[status];
  }
}