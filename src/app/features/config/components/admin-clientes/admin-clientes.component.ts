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
  newCliente: Partial<Cliente> = {
    nombre: '',
    rut: '',
    activo: true
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
      this.newCliente = { nombre: '', rut: '', activo: true };
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
  }
}
