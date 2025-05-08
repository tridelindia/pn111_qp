import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule],
    standalone:true,
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  selectedIndex:number = 1;
   // No option selected by default
constructor(private lay:LayoutComponent, private auth:AuthService, private toast:ToastrService){}
  // Method to set the selected index
  selectOption(index: number) {
   this.lay.selectedIndex = index;
   this.selectedIndex = this.lay.selectedIndex;
  }

  // permissions: string[] = [];

  // ngOnInit(): void {
  //     this.selectOption(0);
  //     this.permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  // }

  permissions: { [key: string]: string[] } = {};

ngOnInit(): void {
  this.selectOption(0);

  const permString = localStorage.getItem('permissions');
  let parsedPermissions: any;

  try {
    parsedPermissions = JSON.parse(permString || '{}');
  } catch (err) {
    console.error('Error parsing permissions from localStorage', err);
    parsedPermissions = {};
  }

  if (typeof parsedPermissions !== 'object' || parsedPermissions === null || Array.isArray(parsedPermissions)) {
    console.warn('Parsed permissions is not a valid object. Resetting.');
    parsedPermissions = {};
  }

  this.permissions = parsedPermissions;
  console.log('Final permissions:', this.permissions);
}
      

  logout() {
    this.auth.logout();
    this.toast.success('Logged out successfully');
  }
  
}
