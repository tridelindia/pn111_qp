import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusCodesService {
  private readonly statusMap: { [code: string]: string } = {
    // Notification Codes
    'N001': 'Notification is Added',
    'N002': 'Notification is Updated',
    'N003': 'Notification is Deleted',
    'N004': 'Notification Status Changed',
    
    // Error Codes
    'E001': 'Info',
    'E002': 'Error',
    'E003': 'Warning',
    'E004': 'Cron Error',
    
    // Station Codes
    'S001': 'Station is Added',
    'S002': 'Station is Updated',
    'S003': 'Station is Deleted',
    
    // User Codes
    'U001': 'New User Added',
    'U002': 'User Data is Updated',
    'U003': 'User is Deleted',

    // Sensor Codes
    'SE001': 'Sensor is Added',
    'SE002': 'Sensor is Updated',
    'SE003': 'Sensor is Deleted',
  };

  getStatusMessage(code: string): string {
    return this.statusMap[code] || `Unknown status code: ${code}`;
  }

  getAllCodes(): { code: string, message: string }[] {
    return Object.entries(this.statusMap).map(([code, message]) => ({ code, message }));
  }
}