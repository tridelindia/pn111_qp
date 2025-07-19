import { Component, OnInit, Renderer2 } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { BuoyComponent } from "../buoy/buoy.component";
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RadarHomeComponent } from "../radar-home/radar-home.component";
import { ReportComponent } from "../report/report.component";
import { TopBarComponent } from "../top-bar/top-bar.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AnalyticsComponent } from "../analytics/analytics.component";
import { UsersComponent } from "../users/users.component";
import { SettingsComponent } from "../settings/settings.component";
import { AnalysisComponent } from "../analysis/analysis.component";
import { HomeAnalysisComponent } from "../analisys/home/home.component";
import { DataHealthComponent } from '../data-health/data-health.component';
import { NotificationComponent } from '../notification/notification.component';


@Component({
    selector: 'app-layout',
    standalone:true,
    imports: [HomeComponent, SidebarComponent, ToastrModule, RouterModule, DashboardComponent, ReportComponent, AnalyticsComponent, UsersComponent, SettingsComponent, TopBarComponent, AnalysisComponent, HomeAnalysisComponent, CommonModule, DataHealthComponent, NotificationComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit{
  selectedIndex: number = 0;
  isTopBarLoading:boolean = false;
  isDashboardLoading:boolean = true;
  selectedStationId!:string;
  sensors:string[]=[];
  Time:string = '';
  StationName!:string;
  getScreenSize() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  constructor(private toast: ToastrService,private renderer: Renderer2){}
  ngOnInit(): void {
    const scren = this.getScreenSize();
this.selectedIndex = 5
    // this.toast.success(`width: ${scren.width}`, `height: ${scren.height}`);
    const theme = localStorage.getItem('selectedColor');
// chartFont = theme!;
//   this.theme = theme!;
  this.onChangeTheme(theme!);
  }
 onChangeTheme(theme:string){
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
    localStorage.setItem('theme', theme);
    console.log("themeeeeee=======", theme);
   const data = window.dispatchEvent(new Event('storage'));
  }
}
