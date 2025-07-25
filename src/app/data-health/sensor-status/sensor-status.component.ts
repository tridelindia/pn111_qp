import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LayoutComponent } from '../../layout/layout.component';

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
  selectedStation: string = '';
  station_Id: string = '';
  hasMeteorology = false;
  
  constructor(
    private http: HttpClient,
    private layout:LayoutComponent
  ) {
    this.station_Id = this.layout.selectedStationId;
    this.hasMeteorology = this.layout.sensors.includes('meteorology');
  }

  ngOnInit() {
    this.station_Id = this.layout.selectedStationId;
    this.onStationSelected(this.station_Id);
  }

  onStationSelected(stationId: string) {
    this.selectedStation = stationId;
    this.fetchLastSensorData(stationId);
  }

  private fetchLastSensorData(stationId: string) {
    this.isLoading = true;
    this.http.get('http://192.168.0.6:3000/api/getLastSensorData', {
      params: { station_id: stationId }
    }).subscribe({
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
      'oceanography.wave.1': 'Significant Wave Height (Hs)',
      'oceanography.wave.2': 'Zero Crossing Period (Tzc)',
      'oceanography.wave.3': 'Mean Zero Crossing Period (Tz)',
      'oceanography.wave.4': 'Mean Wave Period (Tm02)',
      'oceanography.wave.5': 'Wave Direction',
      'oceanography.wave.6': 'Wave Direction (FW)',
      'oceanography.wave.7': 'Mean Wave Direction',
      'oceanography.wave.8': 'Maximum Wave Height (Hmax)',
      'oceanography.wave.9': 'Fourier Coeff. A1',
      'oceanography.wave.10': 'Fourier Coeff. A2',
      'oceanography.wave.11': 'Fourier Coeff. B1',
      'oceanography.wave.12': 'Fourier Coeff. B2',
      'oceanography.wave.13': 'Dominant Period (FW)',
      'oceanography.wave.14': 'Average Wave Height (Havg)',
      'oceanography.current.15': 'Current Direction (Bin 1)',
      'oceanography.current.16': 'Current Speed (Bin 1)',
      'meteorology.wind.17': 'Wind Speed',
      'meteorology.wind.18': 'Wind Direction (deg)',
      'meteorology.wind.19': 'Wind Gust',
      'meteorology.atmospheric.20': 'Air Temperature (°C)',
      'meteorology.atmospheric.21': 'Relative Humidity (%)',
      'meteorology.atmospheric.22': 'Barometric Pressure (hPa)',
      'meteorology.atmospheric.23': 'Rainfall (mm)',
      'meteorology.atmospheric.24': 'Visibility',
      'meteorology.atmospheric.25': 'Global Radiation',
      'water_quality.chemical.26': 'PAH',
      'water_quality.chemical.27': 'Oil in Water',
      'water_quality.chemical.28': 'BT',
      'water_quality.physical.29': 'Turbidity',
      'water_quality.physical.30': 'Conductivity',
      'water_quality.physical.31': 'Dissolved Oxygen',
      'water_quality.physical.32': 'pH',
      'water_quality.physical.33': 'Salinity',
      'water_quality.biological.34': 'Chlorophyll-a',
      'water_quality.biological.35': 'Water Temperature (°C)',
      'water_quality.biological.36': 'Phycoerythrin',
      'water_quality.biological.37': 'Fluorescein Dye'
    };

    const currentTime = new Date();
    const lastReceivedTime = new Date(data.datetime);
    const timeDiff = currentTime.getTime() - lastReceivedTime.getTime();

    type CategoryType = 'oceanography' | 'meteorology' | 'water_quality';
    type CategoryStatus = {
      isActive: boolean;
      lastReceived: string;
    };

    const formatDateTime = (value: Date): string => {
      if (!value) return '';
      const date = new Date(value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }
    
    const categoryStatuses: Record<CategoryType, CategoryStatus> = {
      oceanography: { 
        isActive: true, 
        lastReceived: formatDateTime(lastReceivedTime) 
      },
      meteorology: { 
        isActive: true, 
        lastReceived: formatDateTime(lastReceivedTime) 
      },
      water_quality: { 
        isActive: true, 
        lastReceived: formatDateTime(lastReceivedTime) 
      }
    };

    // Check each parameter and update category status
    Object.entries(data.data.dataPresent).forEach(([key, value]: [string, any]) => {
      const category = key.split('.')[0] as CategoryType;
      const isParameterActive = timeDiff < 15 * 60 * 1000 && value !== 0;
      
      if (category in categoryStatuses) {
        // If any parameter is inactive, mark the whole category as inactive
        if (!isParameterActive) {
          categoryStatuses[category].isActive = false;
        }
      }
    });

    // Convert to array format (after conditionally removing 'meteorology')
    const filteredCategories = Object.entries(categoryStatuses)
      .filter(([category]) => {
        if (!this.hasMeteorology) {
          return category !== 'meteorology';
        }
        return true;
      });

    this.sensorStatuses = filteredCategories.map(([category, status]) => ({
      name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      lastReceived: status.lastReceived,
      isActive: status.isActive
    }));
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