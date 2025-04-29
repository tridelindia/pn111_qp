import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  addLog(userName: string, activity: string, userId: number) {
    const logData = {
      userName,
      activity,
      userId
    };
    
    return this.http.post(`${this.apiUrl}/logs`, logData);
  }

  getLogs() {
    return this.http.get(`${this.apiUrl}/logs`, { responseType: 'text' }).pipe(
      map(data => {
        return data.split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));
      })
    );
  }
}