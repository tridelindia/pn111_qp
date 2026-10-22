import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { GlobalDataService } from '../global-data/global-data.component';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule],
    standalone: true,
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  selectedIndex: number = 0;
  permissions: { [key: string]: string[] } = {};

  constructor(
    public lay: LayoutComponent,
    private data: GlobalDataService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {}

  selectOption(index: number) {
    this.lay.selectedIndex = index;
    this.selectedIndex = index;
    this.data.index = index;
    this.lay.isTopBarLoading = true;
    setTimeout(() => {
      this.lay.isTopBarLoading = false;
    }, 50);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.syncWithUrl(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.syncWithUrl(event.urlAfterRedirects || event.url);
    });

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
  }

  syncWithUrl(url: string) {
    if (!url) return;
    if (url.includes('/home')) this.selectedIndex = 0;
    else if (url.includes('/dashboard')) this.selectedIndex = 1;
    else if (url.includes('/analytics') || url.includes('/analysis')) this.selectedIndex = 2;
    else if (url.includes('/reports')) this.selectedIndex = 3;
    else if (url.includes('/users')) this.selectedIndex = 4;
    else if (url.includes('/settings')) this.selectedIndex = 5;
    else if (url.includes('/data-health')) this.selectedIndex = 7;
    else if (url.includes('/notification')) this.selectedIndex = 8;
    this.lay.selectedIndex = this.selectedIndex;
    this.cdr.detectChanges();
  }

  logout() {
    this.auth.logout();
    this.toast.success('Logged out successfully');
  }
}
