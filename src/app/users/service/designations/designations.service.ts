import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DesignationsService {

  private baseUrl = 'http://localhost:3000/api/designations';

  constructor(private http: HttpClient) {}

  getDesignations() {
    return this.http.get<any[]>(this.baseUrl);
  }

  addDesignation(data: { title: string; description: string }) {
    return this.http.post(this.baseUrl, data);
  }

  deleteDesignation(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}
