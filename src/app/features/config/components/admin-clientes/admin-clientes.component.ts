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
  productos: any[] = [];
  isLoadingProductos = false;

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
    this.productos = [];
    this.isLoadingProductos = true;
    
    this.adminService.getClienteDetail(cliente.id).subscribe({
      next: (res) => {
        console.log('[AdminClientes] Detalle recibido:', res);
        if (res.success) {
          this.selectedCliente = res.data;
          this.loadProductos(cliente.id);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('[AdminClientes] Error cargando detalle:', err);
        this.isLoadingProductos = false;
      }
    });
  }

  loadProductos(clienteId: string): void {
    this.adminService.getClienteProductos(clienteId).subscribe({
      next: (res) => {
        if (res.success) {
          this.productos = res.data;
        }
        this.isLoadingProductos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProductos = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetalle(): void {
    this.selectedCliente = null;
    this.showUserForm = false;
    this.editingUser = null;
    this.newUser = { username: '', password: '', nombre_usuario: '', rol: 'cliente' };
    this.isEditingCliente = false;
  }

  // Edición de detalles del cliente
  isEditingCliente = false;
  isSavingClientDetails = false;

  toggleEditCliente(): void {
    this.isEditingCliente = !this.isEditingCliente;
  }

  saveClienteDetails(): void {
    if (!this.selectedCliente) return;
    this.isSavingClientDetails = true;
    const updateData = {
      nombre: this.selectedCliente.nombre,
      rut: this.selectedCliente.rut,
      activo: this.selectedCliente.activo
    };
    this.adminService.updateCliente(this.selectedCliente.id, updateData).subscribe({
      next: (res) => {
        if (res.success) {
           this.isEditingCliente = false;
           this.loadClientes(); // Reload list to reflect changes
        }
        this.isSavingClientDetails = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSavingClientDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- GESTIÓN DE USUARIOS ---
  showUserForm = false;
  isSavingUser = false;
  editingUser: any = null;
  newUser: any = { username: '', password: '', nombre_usuario: '', rol: 'cliente' };

  toggleUserForm(user?: any): void {
    if (user) {
      this.editingUser = user;
      this.newUser = { ...user, password: '' }; // Password vacío al editar a menos que lo cambie
      this.showUserForm = true;
    } else {
      this.editingUser = null;
      this.newUser = { username: '', password: '', nombre_usuario: '', rol: 'cliente' };
      this.showUserForm = !this.showUserForm;
    }
  }

  saveUser(): void {
    if (!this.selectedCliente) return;
    
    this.isSavingUser = true;
    if (this.editingUser) {
      // Actualizar usuario existente
      const updateData: any = {
        nombre_usuario: this.newUser.nombre_usuario,
        rol: this.newUser.rol
      };
      if (this.newUser.password) {
        updateData.password = this.newUser.password;
      }

      this.adminService.updateUser(this.editingUser.id, updateData).subscribe({
        next: (res) => {
          if (res.success) {
            // Actualizar la lista en memoria
            const index = this.selectedCliente!.usuarios!.findIndex(u => u.id === this.editingUser.id);
            if (index !== -1) {
              this.selectedCliente!.usuarios![index] = res.data;
            }
            this.showUserForm = false;
            this.editingUser = null;
          }
          this.isSavingUser = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSavingUser = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Crear nuevo usuario
      if (!this.newUser.username || !this.newUser.password || !this.newUser.nombre_usuario) {
        this.isSavingUser = false;
        return;
      }

      this.adminService.createAdminUser(this.selectedCliente.id, this.newUser).subscribe({
        next: (res) => {
          if (res.success) {
            if (!this.selectedCliente!.usuarios) {
              this.selectedCliente!.usuarios = [];
            }
            this.selectedCliente!.usuarios.push(res.data);
            this.showUserForm = false;
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
  }

  deleteUser(user: any): void {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${user.username}?`)) return;

    this.adminService.deleteUser(user.id).subscribe({
      next: (res) => {
        if (res.success && this.selectedCliente && this.selectedCliente.usuarios) {
          this.selectedCliente.usuarios = this.selectedCliente.usuarios.filter(u => u.id !== user.id);
          this.cdr.detectChanges();
        }
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
      alerta_homologacion_umbral: this.selectedCliente.umbral,
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
