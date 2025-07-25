import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../../models/role.model';
 
@Injectable({
  providedIn: 'root'
})
export class RoleService {
 
  private baseUrl = 'http://192.168.0.6:3000/api/roles';
 
  constructor(private http: HttpClient) { }
 
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.baseUrl);
  }
 
  addRole(role: Role): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, role);
  }
 
  updateRole(oldName: string, role: Role): Observable<any> {
    return this.http.put(`${this.baseUrl}/updaterole/${oldName}`, role);
  }
 
  deleteRoleByName(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/name/${name}`);
  }
 
}
 
 