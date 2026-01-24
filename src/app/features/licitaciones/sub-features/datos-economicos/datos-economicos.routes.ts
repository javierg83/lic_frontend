import { Routes } from '@angular/router';

export const DATOS_ECONOMICOS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/show/show.component').then(m => m.DatosEconomicosShowComponent)
    },
    {
        path: 'editar',
        loadComponent: () => import('./pages/edit/edit.component').then(m => m.DatosEconomicosEditComponent)
    }
];
