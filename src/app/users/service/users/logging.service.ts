import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private apiUrl = 'http://192.168.0.6:3000/api';

  constructor(private http: HttpClient) { }

  addLog(userName: string, activity: string, userId: number, statusCode: string, filePath: string) {
    const logData = {
      userName,
      activity,
      userId,
      statusCode,
      filePath
    };
    
    return this.http.post(`${this.apiUrl}/logs`, logData);
  }

  getLogs(fromDate?: string, toDate?: string) {
    let params = new HttpParams();
    if (fromDate) {
      params = params.append('fromDate', fromDate);
    }
    if (toDate) {
      params = params.append('toDate', toDate);
    }
    return this.http.get(`${this.apiUrl}/logs`, { responseType: 'text', params: params }).pipe(
      map(data => {
        return data.split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));
      })
    );
  }
}