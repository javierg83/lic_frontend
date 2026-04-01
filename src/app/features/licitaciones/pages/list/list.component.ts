import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LicitacionService } from '../../services/licitacion.service';

@Component({
  selector: 'app-licitacion-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list.component.html',
  styles: [`
    .table-container {
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header-row h2 {
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      text-align: left;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      background-color: #def7ec;
      color: #03543f;
    }
    .btn-show {
      padding: 0.5rem 1rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    .btn-show:hover {
      background-color: #2563eb;
    }
    .btn-new {
      padding: 0.6rem 1.25rem;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn-new:hover {
      background-color: #059669;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .btn-delete:not(:disabled):hover {
      background-color: #fee2e2 !important;
      border-radius: 4px;
    }
  `]
})
export class LicitacionListComponent implements OnInit {
  public licitacionService = inject(LicitacionService);
  private router = inject(Router);

  ngOnInit(): void {
    this.licitacionService.getLicitaciones().subscribe();
  }



    public deletingId: string | null = null;
    public deletingBulk = false;
    public deleteMessage: { text: string; type: 'success' | 'error' | 'info' } | null = null;
    public selectedIds: Set<string> = new Set();

    onShow(id: string): void {
        this.router.navigate(['/licitaciones', id]);
    }

    toggleSelection(id: string): void {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    toggleAll(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const list = this.licitacionService.list()?.licitaciones || [];
        if (checkbox.checked) {
            list.forEach(item => this.selectedIds.add(item.id));
        } else {
            this.selectedIds.clear();
        }
    }

    isAllSelected(): boolean {
        const list = this.licitacionService.list()?.licitaciones || [];
        if (list.length === 0) return false;
        return list.every(item => this.selectedIds.has(item.id));
    }

    onDelete(id: string, nombre: string): void {
        if (!confirm(`¿Estás seguro que deseas eliminar permanentemente la licitación '${nombre}'?`)) {
            return;
        }

        this.deletingId = id;
        this.deleteMessage = null;

        this.licitacionService.deleteLicitacion(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.deleteMessage = { text: res.message || `Licitación '${nombre}' enviada a eliminar en segundo plano.`, type: 'info' };
                    // Optionally unselect if it was selected
                    this.selectedIds.delete(id);
                    setTimeout(() => {
                        this.licitacionService.getLicitaciones().subscribe();
                    }, 500); // Wait a bit for background job to possibly start and reflect
                } else {
                    this.deleteMessage = { text: `Error al intentar eliminar: ${res.message}`, type: 'error' };
                }
                this.deletingId = null;
                setTimeout(() => this.deleteMessage = null, 5000);
            },
            error: (err) => {
                this.deleteMessage = { text: 'Ocurrió un error de red al intentar eliminar.', type: 'error' };
                this.deletingId = null;
                setTimeout(() => this.deleteMessage = null, 5000);
            }
        });
    }

    onBulkDelete(): void {
        const count = this.selectedIds.size;
        if (count === 0) return;
        if (!confirm(`¿Estás seguro que deseas eliminar permanentemente las ${count} licitaciones seleccionadas y todos sus recursos vinculados? Esta acción no se puede deshacer.`)) {
            return;
        }

        this.deletingBulk = true;
        this.deleteMessage = null;
        const idsArray = Array.from(this.selectedIds);

        this.licitacionService.bulkDeleteLicitaciones(idsArray).subscribe({
            next: (res) => {
                if (res.success) {
                    this.deleteMessage = { text: res.message || `${count} licitaciones enviadas a eliminar en segundo plano.`, type: 'info' };
                    this.selectedIds.clear();
                    setTimeout(() => {
                        this.licitacionService.getLicitaciones().subscribe();
                    }, 1000); // Give background task time
                } else {
                    this.deleteMessage = { text: `Error en eliminación masiva: ${res.message}`, type: 'error' };
                }
                this.deletingBulk = false;
                setTimeout(() => this.deleteMessage = null, 5000);
            },
            error: (err) => {
                this.deleteMessage = { text: 'Ocurrió un error de red al intentar la eliminación masiva.', type: 'error' };
                this.deletingBulk = false;
                setTimeout(() => this.deleteMessage = null, 5000);
            }
        });
    }
}
