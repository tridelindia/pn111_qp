import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportComponent } from './report/report.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { DataHealthComponent } from './data-health/data-health.component';
import { NotificationComponent } from './notification/notification.component';
import { AuthGuard } from './services/auth.guard';
import { permissionGuard } from './services/auth.guard.spec';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        component: AuthenticationComponent
    },
    {
        path: 'auth',
        redirectTo: 'login'
    },
    {
        path: 'base',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: 'home',
                component: HomeComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Home', action: 'read' }
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Dashboard', action: 'read' }
            },
            {
                path: 'reports',
                component: ReportComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Reports', action: 'read' }
            },
            {
                path: 'analytics',
                component: AnalyticsComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Analysis', action: 'read' }
            },
            {
                path: 'analysis',
                redirectTo: 'analytics'
            },
            {
                path: 'users',
                component: UsersComponent,
                canActivate: [permissionGuard],
                data: { permission: 'User Management', action: 'read' }
            },
            {
                path: 'settings',
                component: SettingsComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Settings', action: 'read' }
            },
            {
                path: 'data-health',
                component: DataHealthComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Sensor Health', action: 'read' }
            },
            {
                path: 'notification',
                component: NotificationComponent,
                canActivate: [permissionGuard],
                data: { permission: 'Notification', action: 'read' }
            }
        ]
    },
    // Top-level aliases for direct navigation
    { path: 'home', redirectTo: 'base/home' },
    { path: 'dashboard', redirectTo: 'base/dashboard' },
    { path: 'reports', redirectTo: 'base/reports' },
    { path: 'analytics', redirectTo: 'base/analytics' },
    { path: 'analysis', redirectTo: 'base/analytics' },
    { path: 'users', redirectTo: 'base/users' },
    { path: 'settings', redirectTo: 'base/settings' },
    { path: 'data-health', redirectTo: 'base/data-health' },
    { path: 'notification', redirectTo: 'base/notification' },
    {
        path: '**',
        redirectTo: 'login'
    }
];
