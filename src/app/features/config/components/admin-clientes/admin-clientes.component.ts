import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminClientesService, Cliente } from '../../services/admin-clientes.service';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './admin-clientes.component.html',
  styleUrls: ['./admin-clientes.component.css']
})
export class AdminClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  isLoading = false;
  
  // Para creación
  showCreateForm = false;
  newCliente: any = {
    nombre: '',
    rut: '',
    activo: true,
    admin_username_input: '',
    admin_password_input: ''
  };
  isSaving = false;

  // Detalle
  selectedCliente: Cliente | null = null;

  private adminService = inject(AdminClientesService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    console.log('[AdminClientes] Iniciando carga de clientes...');
    this.isLoading = true;
    this.adminService.getClientes().subscribe({
      next: (res) => {
        console.log('[AdminClientes] Respuesta recibida:', res);
        if (res.success) {
          this.clientes = res.data;
          console.log('[AdminClientes] Clientes asignados:', this.clientes.length);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AdminClientes] Error cargando clientes:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.newCliente = { nombre: '', rut: '', activo: true, admin_username_input: '', admin_password_input: '' };
    }
  }

  saveCliente(): void {
    if (!this.newCliente.nombre || !this.newCliente.rut) return;

    this.isSaving = true;
    this.adminService.createCliente(this.newCliente).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadClientes();
          this.toggleCreateForm();
        }
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  verDetalle(cliente: Cliente): void {
    console.log('[AdminClientes] Cargando detalle para:', cliente.id);
    this.adminService.getClienteDetail(cliente.id).subscribe({
      next: (res) => {
        console.log('[AdminClientes] Detalle recibido:', res);
        if (res.success) {
          this.selectedCliente = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('[AdminClientes] Error cargando detalle:', err)
    });
  }

  cerrarDetalle(): void {
    this.selectedCliente = null;
    this.newAdminUsername = '';
    this.newAdminPassword = '';
  }

  // Creación de usuario inicial para cliente existente
  newAdminUsername = '';
  newAdminPassword = '';
  isSavingUser = false;

  crearAdminUser(): void {
    if (!this.selectedCliente || !this.newAdminUsername || !this.newAdminPassword) return;

    this.isSavingUser = true;
    this.adminService.createAdminUser(this.selectedCliente.id, {
      username: this.newAdminUsername,
      password: this.newAdminPassword
    }).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Usuario creado correctamente');
          // Actualizar vista
          if (this.selectedCliente) {
            this.selectedCliente.admin_username = this.newAdminUsername;
          }
          this.newAdminUsername = '';
          this.newAdminPassword = '';
        }
        this.isSavingUser = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingUser = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Cambio de password
  newPassword = '';
  isUpdatingPassword = false;

  cambiarPassword(): void {
    if (!this.selectedCliente?.admin_username || !this.newPassword) return;

    this.isUpdatingPassword = true;
    this.adminService.updatePassword(this.selectedCliente.admin_username, this.newPassword).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Contraseña actualizada correctamente');
          this.newPassword = '';
        }
        this.isUpdatingPassword = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUpdatingPassword = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Configuración
  isSavingConfig = false;
  configSuccessMessage = '';

  guardarConfiguracion(): void {
    if (!this.selectedCliente) return;

    this.isSavingConfig = true;
    this.configSuccessMessage = '';

    const configData = {
      alerta_homologacion_umbral: this.selectedCliente.alerta_homologacion_umbral,
      alerta_homologacion_activa: this.selectedCliente.alerta_homologacion_activa,
      correo_contacto: this.selectedCliente.correo_contacto
    };

    this.adminService.updateConfiguracion(this.selectedCliente.id, configData).subscribe({
      next: (res) => {
        if (res.success) {
          this.configSuccessMessage = 'Configuración guardada exitosamente';
          setTimeout(() => this.configSuccessMessage = '', 3000);
        }
        this.isSavingConfig = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingConfig = false;
        this.cdr.detectChanges();
      }
    });
  }
}
