import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { CurrentUser } from '../user-model/user-model.module';
import { Router } from '@angular/router';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
 
  CurrentUser!: CurrentUser;
 
  private apiUrl = 'http://192.168.0.126:3000/api/users/';
 
  constructor(private http:HttpClient, private router:Router) { }
  // constructor(private http:HttpClient ) {}
  login(cred: any): Observable<CurrentUser> {
    return this.http.post<CurrentUser>(`${this.apiUrl}login`, cred).pipe(
      tap((user: any) => {
        console.log('User returned from login:', user);
     
        const permissions = typeof user.permissions === 'object' && user.permissions !== null
          ? user.permissions
          : {};
     
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('permissions', JSON.stringify(permissions));
      })
     
    );
  }  
 
  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }
 
  isAuthenticated(): boolean {
    return !!localStorage.getItem('loginTime') && !!localStorage.getItem('username');
  }
 
  resetPassword(username: string, email: string, newPassword: string) {
  return this.http.post(`${this.apiUrl}resetPassword`, {
    username,
    email,
    newPassword
  });
}
 
  logout(): void {
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('permissions');
    this.CurrentUser = null!;
    this.router.navigate(['/login']);
  }
}
 
 