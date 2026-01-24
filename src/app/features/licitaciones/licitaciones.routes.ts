import { Routes } from '@angular/router';

export const LICITACIONES_ROUTES: Routes = [
    {
        path: 'new',
        loadComponent: () => import('./pages/new/new.component').then(m => m.LicitacionNewComponent)
    },
    {
        path: 'list',
        loadComponent: () => import('./pages/list/list.component').then(m => m.LicitacionListComponent)
    },
    {
        path: ':id',
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/show/show.component').then(m => m.LicitacionShowComponent)
            },
            {
                path: 'datos-economicos',
                loadChildren: () => import('./sub-features/datos-economicos/datos-economicos.routes').then(m => m.DATOS_ECONOMICOS_ROUTES)
            }
        ]
    },
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    }
];
