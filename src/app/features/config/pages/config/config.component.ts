import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';
import { AdminClientesComponent } from '../../components/admin-clientes/admin-clientes.component';
import { TenantConfigComponent } from '../../components/tenant-config/tenant-config.component';

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [CommonModule, AdminClientesComponent, TenantConfigComponent],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigPageComponent implements OnInit {
  isAdmin = false;
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    console.log('[ConfigPage] Iniciado. Modo Admin:', this.isAdmin);
  }
}
