import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface SensorStatus {
  name: string;
  lastReceived: string;
  isActive: boolean;
}

type SortDirection = 'asc' | 'desc' | '';
type SortKey = keyof SensorStatus;

@Component({
  selector: 'app-sensor-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sensor-status.component.html',
  styleUrl: './sensor-status.component.css'
})
export class SensorStatusComponent implements OnInit {
  sensorStatuses: SensorStatus[] = [];
  isLoading: boolean = true;
  
  searchTerm: string = '';
  sortKey: SortKey | null = null;
  sortDirection: SortDirection = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchLastSensorData();
  }

  private fetchLastSensorData() {
    this.http.get('http://localhost:3000/api/getLastSensorData').subscribe({
      next: (data: any) => {
        this.processSensorData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching sensor data:', error);
        this.isLoading = false;
      }
    });
  }

  private processSensorData(data: any) {
    const parameterMapping: { [key: string]: string } = {
      'oceanography.wave.0': 'Wave Heading',
      'oceanography.wave.1': 'Wave Height',
      'oceanography.wave.2': 'Tzc',
      'oceanography.wave.3': 'Tz',
      'oceanography.wave.4': 'Tm02',
      'oceanography.wave.5': 'Wave Direction',
      'oceanography.wave.6': 'Wave Direction FW',
      'oceanography.wave.7': 'Mean Wave Direction',
      'oceanography.wave.8': 'Max Wave Height',
      'oceanography.wave.9': 'Fourier Coefficient a1',
      'oceanography.wave.10': 'Fourier Coefficient a2',
      'oceanography.wave.11': 'Fourier Coefficient b1',
      'oceanography.wave.12': 'Fourier Coefficient b2',
      'oceanography.wave.13': 'Dominant Time Period FW',
      'oceanography.wave.14': 'Havg',
      
      'oceanography.current.15': 'Current Direction',
      'oceanography.current.16': 'Current Speed',
      
      'meteorology.wind.17': 'Wind Speed',
      'meteorology.wind.18': 'Wind Direction',
      'meteorology.wind.19': 'Wind Gust',
      
      'meteorology.atmospheric.20': 'Temperature (Air)',
      'meteorology.atmospheric.21': 'Relative Humidity',
      'meteorology.atmospheric.22': 'Barometric Pressure',
      'meteorology.atmospheric.23': 'Rainfall',
      'meteorology.atmospheric.24': 'Visibility',
      'meteorology.atmospheric.25': 'Global Radiation',
      
      'water_quality.chemical.26': 'PAH',
      'water_quality.chemical.27': 'Oil in Water',
      'water_quality.chemical.28': 'BT',
      
      'water_quality.physical.29': 'Turbidity',
      'water_quality.physical.30': 'Conductivity',
      'water_quality.physical.31': 'Dissolved Oxygen',
      'water_quality.physical.32': 'pH Level',
      'water_quality.physical.33': 'Salinity',
      
      'water_quality.biological.34': 'Chlorophyll-a',
      'water_quality.biological.35': 'Water Temperature',
      'water_quality.biological.36': 'Phycoerythrin',
      'water_quality.biological.37': 'Fluorescein Dye'
    };

    this.sensorStatuses = Object.entries(data.data.dataPresent).map(([key, value]: [string, any]) => {
      const currentTime = new Date();
      const lastReceivedTime = new Date(data.timestamp);
      const timeDiff = currentTime.getTime() - lastReceivedTime.getTime();
      const isActive = timeDiff < 15 * 60 * 1000 && value !== 0;

      const displayName = parameterMapping[key] || this.formatRawParameterName(key);

      return {
        name: displayName,
        lastReceived: lastReceivedTime.toLocaleString(),
        isActive: isActive
      };
    });
  }

  private formatRawParameterName(key: string): string {
    const parts = key.split('.');
    if (parts.length < 3) return key;

    const category = parts[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const type = parts[1].replace(/\b\w/g, l => l.toUpperCase());
    const id = parts[2];

    return `${category} ${type} ${id}`;
  }

  get filteredStatuses(): SensorStatus[] {
    let filtered = this.sensorStatuses;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(status => 
        status.name.toLowerCase().includes(term) ||
        status.lastReceived.toLowerCase().includes(term) ||
        (status.isActive ? 'active' : 'inactive').includes(term)
      );
    }

    if (this.sortKey && this.sortDirection) {
      filtered.sort((a, b) => {
        const aValue = a[this.sortKey!];
        const bValue = b[this.sortKey!];
        
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
}