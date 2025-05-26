import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusCodesService {
  private readonly statusMap: { [code: string]: string } = {
    // Notification Codes
    'N001': 'Notification Add',
    'N002': 'Notification Update',
    'N003': 'Notification Delete',
    'N004': 'Notification Status Change',
    
    // Error Codes
    'E001': 'Info',
    'E002': 'Error',
    'E003': 'Warning',
    'E004': 'Cron Error',
    
    // Station Codes
    'S001': 'Station Add',
    'S002': 'Station Update',
    'S003': 'Station Delete',
    
    // User Codes
    'U001': 'User Add',
    'U002': 'User Update',
    'U003': 'User Delete',
  
    // Sensor Codes
    'SE001': 'Sensor Add',
    'SE002': 'Sensor Update',
    'SE003': 'Sensor Delete',
  };  

  getStatusMessage(code: string): string {
    return this.statusMap[code] || `Unknown status code: ${code}`;
  }

  getAllCodes(): { code: string, message: string }[] {
    return Object.entries(this.statusMap).map(([code, message]) => ({ code, message }));
  }
}