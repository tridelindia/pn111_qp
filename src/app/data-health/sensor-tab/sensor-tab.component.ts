import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

interface Sensor {
  id: string;
  name: string;
  icon: string;
}

interface SubTab {
  value: string;
  title: string;
}

interface Tab {
  value: string;
  title: string;
  subTabs: SubTab[];
}

@Component({
  selector: 'app-sensor-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    DatePickerModule,
    CascadeSelectModule,
    MultiSelectModule,
    TableModule,
    CalendarModule,
    TooltipModule
  ],
  templateUrl: './sensor-tab.component.html',
  styleUrl: './sensor-tab.component.scss'
})
export class SensorTabComponent {
  @Input() activeSensor: string = '';
  @Input() loading: boolean = false;
  @Output() sensorSelected = new EventEmitter<string>();
  @Output() updateData = new EventEmitter<{sensor: string, tab: string}>();
  @Output() dateRangeChange = new EventEmitter<{ from: Date | null; to: Date | null }>();
  @Output() manualRefresh = new EventEmitter<void>();
  
  activeTab: string = '';
  dateRange: Date[] = [new Date(new Date().setDate(new Date().getDate() - 1)), new Date()];
  hourFormat: string = '24';
  selectedTabs: { [key: string]: string[] } = {};

  sensors: Sensor[] = [
    { id: 'oceanography', name: 'Oceanography', icon: '🌊' },
    { id: 'meteorology', name: 'Meteorology', icon: '🌤️' },
    { id: 'water_quality', name: 'Water Quality', icon: '🧪' }
  ];

  sensorTabs: { [key: string]: Tab[] } = {
    'oceanography': [
      {
        value: 'wave',
        title: 'Wave',
        subTabs: [
          { value: '0', title: 'Wave Heading' },
          { value: '1', title: 'Significant Wave Height (Hs)' },
          { value: '2', title: 'Zero Crossing Period (Tzc)' },
          { value: '3', title: 'Mean Zero Crossing Period (Tz)' },
          { value: '4', title: 'Mean Wave Period (Tm02)' },
          { value: '5', title: 'Wave Direction' },
          { value: '6', title: 'Wave Direction (FW)' },
          { value: '7', title: 'Mean Wave Direction' },
          { value: '8', title: 'Maximum Wave Height (Hmax)' },
          { value: '9', title: 'Fourier Coeff. A1' },
          { value: '10', title: 'Fourier Coeff. A2' },
          { value: '11', title: 'Fourier Coeff. B1' },
          { value: '12', title: 'Fourier Coeff. B2' },
          { value: '13', title: 'Dominant Period (FW)' },
          { value: '14', title: 'Average Wave Height (Havg)' }
        ]
      },
      {
        value: 'current',
        title: 'Current',
        subTabs: [
          { value: '15', title: 'Current Direction (Bin 1)' },
          { value: '16', title: 'Current Speed (Bin 1)' },
        ]
      }
    ],
    'meteorology': [
      {
        value: 'wind',
        title: 'Wind',
        subTabs: [
          { value: '17', title: 'Wind Speed' },
          { value: '18', title: 'Wind Direction (deg)' },
          { value: '19', title: 'Wind Gust' }
        ]
      },
      {
        value: 'atmospheric',
        title: 'Atmospheric Conditions',
        subTabs: [
          { value: '20', title: 'Air Temperature (°C)' },
          { value: '21', title: 'Relative Humidity (%)' },
          { value: '22', title: 'Barometric Pressure (hPa)' },
          { value: '23', title: 'Rainfall (mm)' },
          { value: '24', title: 'Visibility' },
          { value: '25', title: 'Global Radiation' }
        ]
      }
    ],
    'water_quality': [
      {
        value: 'chemical',
        title: 'Chemical Pollutants',
        subTabs: [
          { value: '26', title: 'PAH' },
          { value: '27', title: 'Oil in Water' },
          { value: '28', title: 'BT' }
        ]
      },
      {
        value: 'physical',
        title: 'Physical/Chemical Parameters',
        subTabs: [
          { value: '29', title: 'Turbidity' },
          { value: '30', title: 'Conductivity' },
          { value: '31', title: 'Dissolved Oxygen' },
          { value: '32', title: 'pH' },
          { value: '33', title: 'Salinity' }
        ]
      },
      {
        value: 'biological',
        title: 'Biological/Optical Parameters',
        subTabs: [
          { value: '34', title: 'Chlorophyll-a' },
          { value: '35', title: 'Water Temperature (°C)' },
          { value: '36', title: 'Phycoerythrin' },
          { value: '37', title: 'Fluorescein Dye' }
        ]
      }
    ]
  };

  get currentTabs(): Tab[] {
    return this.sensorTabs[this.activeSensor] || [];
  }

  selectSensor(sensorId: string) {
    if (this.activeSensor === sensorId) {
      this.activeSensor = '';
      this.sensorSelected.emit('');
      this.selectedTabs = {};
    } else {
      this.activeSensor = sensorId;
      this.sensorSelected.emit(sensorId);
      this.selectedTabs = {};
      this.sensorTabs[sensorId]?.forEach(tab => {
        this.selectedTabs[tab.value] = [];
      });
    }
  }

  onTabChange(tabValue: string) {
    this.updateData.emit({
      sensor: this.activeSensor,
      tab: Object.values(this.selectedTabs).flat().join(',')
    });
  }

  onDateRangeChange(event: any) {
    if (event && Array.isArray(event)) {
      this.dateRange = event;
    }
  }

  onApplyDateRange() {
    this.dateRangeChange.emit({
      from: this.dateRange[0] ? new Date(this.dateRange[0]) : null,
      to: this.dateRange[1] ? new Date(this.dateRange[1]) : null
    });
  }

  onRefreshClick() {
    this.manualRefresh.emit();
  }
}
