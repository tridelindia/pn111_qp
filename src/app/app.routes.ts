import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from './services/auth.guard';
import { permissionGuard } from './services/permission.guard';
import { HeatmapComponent } from './analytics/heatmap/heatmap.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo:'auth'
    },
    {
        path:'auth',
        component:AuthenticationComponent
    },
    {
        path: 'base',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children:[
            {
                path:'home',
                component: HomeComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Home', action: 'read'}
            },
            {
                path:'dashboard',
                component:DashboardComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Dashboard', action: 'read'}
            },
            {
                path:'reports',
                component:ReportComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Reports', action: 'read'}
            },
            {
                path:'analytics',
                component:AnalyticsComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Analytics', action: 'read'}
            },
            {
                path:'users',
                component:UsersComponent,
                canActivate: [permissionGuard],
                data: { permission: 'User Management', action: 'read'}
            },
            {
                path:'settings',
                component:SettingsComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Settings', action: 'read'}
            }
            
        ]
    },
    {
        path:'**',
        redirectTo:'auth'
    }

];
