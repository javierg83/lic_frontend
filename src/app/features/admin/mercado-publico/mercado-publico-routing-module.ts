import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MercadoPublicoDashboard } from './mercado-publico-dashboard/mercado-publico-dashboard';
import { MpDescargasList } from './mp-descargas-list/mp-descargas-list';
import { MpStagingListComponent } from './mp-staging-list/mp-staging-list';
import { MpStagingDetail } from './mp-staging-detail/mp-staging-detail';

const routes: Routes = [
  { path: '', component: MercadoPublicoDashboard },
  { path: 'descargas', component: MpDescargasList },
  { path: 'staging', component: MpStagingListComponent },
  { path: 'staging/:id', component: MpStagingDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MercadoPublicoRoutingModule { }
