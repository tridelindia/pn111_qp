import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoggingService } from '../service/users/logging.service';
import { HttpClientModule } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

interface LogEntry {
  timestamp: string;
  userName: string;
  message: string;
  userId: number;
  statusCode: string | null;
  filePath: string | null;
}

interface User {
  id: number;
  name: string;
}

@Component({
    selector: 'app-userlog',
    standalone:true,
    imports: [
      CommonModule, 
      FormsModule, 
      HttpClientModule, 
      ProgressSpinnerModule,
      ButtonModule,
      CardModule,
      MessageModule,
      InputTextModule,
      DropdownModule,
      CalendarModule
    ],
    providers: [LoggingService],
    templateUrl: './userlog.component.html',
    styleUrl: './userlog.component.css'
})
export class UserlogComponent {
  logs: LogEntry[] = [];
  isLoading = true;
  error: string | null = null;
  filteredLogs: LogEntry[] = [];
  searchTerm = '';
  users: User[] = [];
  selectedUser: User | null = null;
  dateRange: Date[] = [new Date(new Date().setDate(new Date().getDate())), new Date()];

  constructor(private logService: LoggingService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.error = null;
    
    this.logService.getLogs().subscribe({
      next: (response) => {
        if (response[0]?.logs) {
          this.logs = response[0].logs;
          this.filteredLogs = [...response[0].logs];
          this.loadUsers();
        } else {
          this.error = 'Invalid response format';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load logs. Please try again later.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadUsers(): void {
    const uniqueUsers = new Map<number, User>();
    this.logs.forEach(log => {
      if (!uniqueUsers.has(log.userId)) {
        uniqueUsers.set(log.userId, {
          id: log.userId,
          name: log.userName
        });
      }
    });
    this.users = Array.from(uniqueUsers.values());
  }

  filterLogs(): void {
    let filtered = [...this.logs];
    
    if (this.selectedUser) {
      filtered = filtered.filter(log => log.userId === this.selectedUser!.id);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(term) || 
        log.message.toLowerCase().includes(term) ||
        log.timestamp.toLowerCase().includes(term) ||
        log.userId.toString().includes(term)
      );
    }
    
    this.filteredLogs = filtered;
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  filterByDateRange(): void {
    if (!this.dateRange || this.dateRange.length !== 2) {
      this.filteredLogs = [...this.logs];
      return;
    }

    const [startDate, endDate] = this.dateRange;
    const formattedStartDate = new Date(startDate);
    formattedStartDate.setHours(0, 0, 0, 0);
    
    const formattedEndDate = new Date(endDate);
    formattedEndDate.setHours(23, 59, 59, 999);

    this.isLoading = true;
    this.error = null;

    this.logService.getLogs(
      formattedStartDate.toISOString(),
      formattedEndDate.toISOString()
    ).subscribe({
      next: (response: any[]) => {
        if (response[0]?.logs) {
          this.logs = response[0].logs;
          this.filteredLogs = [...response[0].logs];
          this.loadUsers();
        } else {
          this.error = 'Invalid response format';
        }
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to load logs. Please try again later.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}
