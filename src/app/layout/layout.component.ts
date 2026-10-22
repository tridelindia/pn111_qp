import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [SidebarComponent, TopBarComponent, CommonModule, RouterModule, ToastrModule],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  selectedIndex: number = 0;    // page index for topbar
  isTopBarLoading: boolean = false;
  isDashboardLoading: boolean = true;
  selectedStationId!: string;
  sensors: string[] = [];
  Time: string = '';

  getScreenSize() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  constructor(
    private toast: ToastrService,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateIndexFromUrl(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateIndexFromUrl(event.urlAfterRedirects || event.url);
    });

    const theme = localStorage.getItem('selectedColor');
    this.onChangeTheme(theme!);
  }

  updateIndexFromUrl(url: string): void {
    if (!url) return;
    if (url.includes('/home')) {
      this.selectedIndex = 0;
    } else if (url.includes('/dashboard')) {
      this.selectedIndex = 1;
    } else if (url.includes('/analytics') || url.includes('/analysis')) {
      this.selectedIndex = 2;
    } else if (url.includes('/reports')) {
      this.selectedIndex = 3;
    } else if (url.includes('/users')) {
      this.selectedIndex = 4;
    } else if (url.includes('/settings')) {
      this.selectedIndex = 5;
    } else if (url.includes('/data-health')) {
      this.selectedIndex = 7;
    } else if (url.includes('/notification')) {
      this.selectedIndex = 8;
    }
  }

  onChangeTheme(theme: string) {
    if (theme) {
      this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    }
  }
}
