import { Component, Input } from '@angular/core';
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
export class SensorStatsComponent {
  @Input() activeSensor: string = 'sensor1';
  @Input() selectedTabs: string[] = [];

  searchTerm: string = '';
  sortKey: SortKey | null = null;
  sortDirection: SortDirection = '';
  
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  stats: SensorStat[] = [
    { name: 'Wave Height', average: 2.4, percentage: 92, status: 'satisfactory', tabId: '1' },
    { name: 'Wave Direction', average: 180, percentage: 85, status: 'marginal', tabId: '5' },
    { name: 'Current Speed', average: 1.2, percentage: 97, status: 'satisfactory', tabId: '16' },
    { name: 'Wind Speed', average: 8.5, percentage: 78, status: 'unsatisfactory', tabId: '17' },
    { name: 'Temperature (Air)', average: 22.1, percentage: 95, status: 'satisfactory', tabId: '20' },
    { name: 'Relative Humidity', average: 65.3, percentage: 88, status: 'satisfactory', tabId: '21' },
    { name: 'Barometric Pressure', average: 1013.5, percentage: 90, status: 'satisfactory', tabId: '22' },
    { name: 'Turbidity', average: 1.8, percentage: 82, status: 'marginal', tabId: '29' },
    { name: 'Conductivity', average: 45.2, percentage: 94, status: 'satisfactory', tabId: '30' },
    { name: 'Dissolved Oxygen', average: 8.2, percentage: 89, status: 'satisfactory', tabId: '31' }
  ];

  get filteredStats(): SensorStat[] {
    let filtered = this.stats;
    
    if (this.selectedTabs.length > 0) {
      filtered = filtered.filter(stat => 
        stat.tabId && this.selectedTabs.includes(stat.tabId)
      );
    }
    
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

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalItems(): number {
    return this.stats.length;
  }

  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} entries`;
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
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
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