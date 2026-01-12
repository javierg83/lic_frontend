import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },
];
