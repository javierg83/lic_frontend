import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntregasService } from '../../services/entregas.service';
import { EntregaResponse } from '../../models/entregas.model';

@Component({
    selector: 'app-entregas-card',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './entregas-card.component.html',
    styleUrls: ['./entregas-card.component.css']
})
export class EntregasCardComponent implements OnInit {
    @Input() licitacionId!: string;
    @Input() showTitle = true;
    @Input() showEditButton = true;

    private entregasService = inject(EntregasService);

    public datos = signal<EntregaResponse | null>(null);
    public loading = signal<boolean>(true);
    public error = signal<string | null>(null);

    // Editing state
    public isEditing = signal<boolean>(false);
    public editForm = signal<Partial<EntregaResponse>>({});
    public saving = signal<boolean>(false);

    // Notifications
    public notification = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

    ngOnInit(): void {
        if (this.licitacionId) {
            this.fetchDatos();
        } else {
            this.error.set('ID de licitación no proporcionado');
            this.loading.set(false);
        }
    }

    fetchDatos(): void {
        this.loading.set(true);
        this.entregasService.getEntregas(this.licitacionId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.datos.set(res.data);
                } else {
                    this.error.set(res.message);
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar datos de entrega');
                this.loading.set(false);
            }
        });
    }

    startEdit(): void {
        if (this.datos()) {
            this.isEditing.set(true);
            this.editForm.set({ ...this.datos()! });
        }
    }

    cancelEdit(): void {
        this.isEditing.set(false);
        this.editForm.set({});
    }

    saveEdit(): void {
        if (!this.licitacionId) return;

        this.saving.set(true);
        this.entregasService.updateEntregas(this.licitacionId, this.editForm()).subscribe({
            next: (res) => {
                if (res.success) {
                    this.datos.set(res.data);
                    this.showNotification('Datos de entrega actualizados correctamente', 'success');
                    this.cancelEdit();
                } else {
                    this.showNotification(res.message || 'Error al actualizar', 'error');
                }
                this.saving.set(false);
            },
            error: () => {
                this.showNotification('Error de conexión', 'error');
                this.saving.set(false);
            }
        });
    }

    private showNotification(message: string, type: 'success' | 'error'): void {
        this.notification.set({ message, type });
        setTimeout(() => {
            this.notification.set({ message: '', type: null });
        }, 3000);
    }
}
