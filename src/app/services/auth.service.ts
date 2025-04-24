import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentUser } from '../users/models/user.model';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  CurrentUser!: CurrentUser;

  private apiUrl = 'http://localhost:3000/api/users/';

  constructor(private http:HttpClient, private router:Router) { }


  login(cred: any): Observable<CurrentUser> {
    return this.http.post<CurrentUser>(`${this.apiUrl}login`, cred).pipe(
      tap((user: any) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('permissions', JSON.stringify(user.permissions || []));
      })
    );
  }
  
  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('loginTime') && !!localStorage.getItem('username');
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