import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  searchTerm: string = '';
  sortKey: SortKey | null = null;
  sortDirection: SortDirection = '';

  stats: SensorStat[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiData'] && this.apiData) {
      this.updateStatsFromApiData();
    }
  }

  private updateStatsFromApiData(): void {
    if (!this.apiData || !this.apiData.data || !this.apiData.data.length) {
      this.stats = [];
      return;
    }

    const parameterMapping: { [key: string]: { name: string; tabId: string } } = {
      'oceanography.wave.1': { name: 'Wave Height', tabId: '1' },
      'oceanography.wave.2': { name: 'Wave Period', tabId: '2' },
      'oceanography.wave.3': { name: 'Wave Energy', tabId: '3' },
      'oceanography.wave.4': { name: 'Wave Power', tabId: '4' },
      'oceanography.wave.5': { name: 'Wave Direction', tabId: '5' },
      'oceanography.current.6': { name: 'Current Direction', tabId: '6' },
      'oceanography.current.7': { name: 'Current U Component', tabId: '7' },
      'oceanography.current.8': { name: 'Current V Component', tabId: '8' },
      'oceanography.current.9': { name: 'Current Magnitude', tabId: '9' },
      'oceanography.current.10': { name: 'Current Direction (True)', tabId: '10' },
      'oceanography.current.11': { name: 'Current Speed', tabId: '11' },
      'oceanography.current.12': { name: 'Current Direction (Magnetic)', tabId: '12' },
      'oceanography.current.13': { name: 'Current U Component (True)', tabId: '13' },
      'oceanography.current.14': { name: 'Current V Component (True)', tabId: '14' },
      'oceanography.current.15': { name: 'Current U Component (Magnetic)', tabId: '15' },
      'oceanography.current.16': { name: 'Current V Component (Magnetic)', tabId: '16' },
      'meteorology.wind.17': { name: 'Wind Speed', tabId: '17' },
      'meteorology.wind.18': { name: 'Wind Direction', tabId: '18' },
      'meteorology.wind.19': { name: 'Wind Gust', tabId: '19' },
      'meteorology.atmospheric.20': { name: 'Temperature (Air)', tabId: '20' },
      'meteorology.atmospheric.21': { name: 'Relative Humidity', tabId: '21' },
      'meteorology.atmospheric.22': { name: 'Barometric Pressure', tabId: '22' },
      'meteorology.atmospheric.23': { name: 'Dew Point', tabId: '23' },
      'meteorology.atmospheric.24': { name: 'Heat Index', tabId: '24' },
      'meteorology.atmospheric.25': { name: 'Wind Chill', tabId: '25' },
      'meteorology.atmospheric.26': { name: 'Visibility', tabId: '26' },
      'meteorology.atmospheric.27': { name: 'Solar Radiation', tabId: '27' },
      'meteorology.atmospheric.28': { name: 'UV Index', tabId: '28' },
      'water_quality.physical.29': { name: 'Turbidity', tabId: '29' },
      'water_quality.physical.30': { name: 'Conductivity', tabId: '30' },
      'water_quality.physical.31': { name: 'Dissolved Oxygen', tabId: '31' },
      'water_quality.physical.32': { name: 'Salinity', tabId: '32' },
      'water_quality.physical.33': { name: 'Water Temperature', tabId: '33' },
      'water_quality.physical.34': { name: 'pH', tabId: '34' },
      'water_quality.physical.35': { name: 'Chlorophyll', tabId: '35' },
      'water_quality.physical.36': { name: 'Total Suspended Solids', tabId: '36' }
    };

    const latestData = this.apiData.data[this.apiData.data.length - 1];
    if (!latestData || !latestData.dataPresent) {
      this.stats = [];
      return;
    }
    this.stats = Object.entries(latestData.dataPresent)
      .filter(([key]) => parameterMapping[key])
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