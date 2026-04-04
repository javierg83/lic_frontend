import { Routes } from '@angular/router';

import { Login } from './core/auth_user/pages/login/login';
import { authGuard } from './core/guards/auth-guard';
import { AuthLayoutComponent } from './layout/auth-layout';
import { MainLayoutComponent } from './layout/main-layout';
import { DEMO_ROUTES } from './features/demo/demo.routes';
import { MAIN_ROUTES } from './features/main/main.routes';

export const routes: Routes = [

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: Login },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: MAIN_ROUTES,
  },
  {
    path: 'demo',
    component: MainLayoutComponent,
    canMatch: [authGuard],
    children: DEMO_ROUTES
  },
  {
    path: 'licitaciones',
    component: MainLayoutComponent,
    canMatch: [authGuard],
    loadChildren: () => import('./features/licitaciones/licitaciones.routes').then(m => m.LICITACIONES_ROUTES)
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canMatch: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'config',
    component: MainLayoutComponent,
    canMatch: [authGuard],
    loadChildren: () => import('./features/config/config.routes').then(m => m.CONFIG_ROUTES)
  },

  { path: '**', redirectTo: 'login' }

];
