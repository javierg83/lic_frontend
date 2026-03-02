import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/index/index.component').then(m => m.DashboardIndexComponent)
    }
];
