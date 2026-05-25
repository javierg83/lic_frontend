import { Routes } from '@angular/router';

import { Login } from './core/auth_user/pages/login/login';
import { authGuard } from './core/guards/auth-guard';
import { AuthLayoutComponent } from './layout/auth-layout';
import { MainLayoutComponent } from './layout/main-layout';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { DEMO_ROUTES } from './features/demo/demo.routes';
import { MAIN_ROUTES } from './features/main/main.routes';

export const routes: Routes = [

  // ── RUTAS PÚBLICAS (Landing) ──────────────────────────────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/landing/landing.component').then(m => m.LandingComponent)
      }
    ]
  },

  // ── AUTH (login) ──────────────────────────────────────────────────────
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: Login },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'onboarding',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/onboarding/wizard.component').then(m => m.WizardComponent)
      }
    ]
  },

  // Redirección de compatibilidad para el login antiguo
  { path: 'login', redirectTo: 'auth/login' },

  // ── DASHBOARD Y SISTEMA (Protegido) ───────────────────────────────────
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
  {
    path: 'admin/monitoring',
    component: MainLayoutComponent,
    canMatch: [authGuard],
    loadChildren: () => import('./features/monitoring/monitoring.routes').then(m => m.MONITORING_ROUTES)
  },
  {
    path: 'admin/mercado-publico',
    component: MainLayoutComponent,
    canMatch: [authGuard],
    loadChildren: () => import('./features/admin/mercado-publico/mercado-publico-module').then(m => m.MercadoPublicoModule)
  },

  { path: '**', redirectTo: '' }

];
