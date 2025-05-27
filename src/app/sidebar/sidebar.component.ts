import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { GlobalDataService } from '../global-data/global-data.component';
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
  selectedIndex:number = 2;
   // No option selected by default
constructor(private lay:LayoutComponent, private data:GlobalDataService, private cdr:ChangeDetectorRef, private auth:AuthService, private toast:ToastrService){}
  // Method to set the selected index
  selectOption(index: number) {
   this.lay.selectedIndex = index;
   this.selectedIndex = this.lay.selectedIndex;
   this.data.index = index;
   this.lay.isTopBarLoading= true;
   setTimeout(() => {
    this.lay.isTopBarLoading=false;
   }, 50);
   this.cdr.detectChanges();

  }
  permissions: { [key: string]: string[] } = {};
  
  ngOnInit(): void {
      this.selectOption(1);
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
