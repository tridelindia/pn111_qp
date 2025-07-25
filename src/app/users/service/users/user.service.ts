import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  private baseUrl = 'http://192.168.0.6:3000/api/users';
 
  constructor(private http: HttpClient) {}
 
  getUsers() {
    return this.http.get<any[]>(this.baseUrl);
  }
 
  checkUsername(username: string) {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-username`, {
      params: { username },
    });
  }
 
  checkEmail(email: string) {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/check-email`, {
      params: { email },
    });
  }  
 
  addUser(user: any) {
    return this.http.post<any>(this.baseUrl, user);
  }
 
  updateUser(id: number, user: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, user);
  }
 
  deleteUser(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
 
}
