import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LicitacionService } from '../../services/licitacion.service';
import { AuthService } from '../../../../core/services/auth';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-licitacion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list.component.html',
  styles: [`
    .sort-header {
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
    .sort-header:hover {
      background-color: #f3f4f6;
    }
    .alert-bell {
      font-size: 1.2rem;
      margin-left: 0.5rem;
      display: inline-block;
      animation: bell-ring 2s infinite ease-in-out;
      transform-origin: top center;
    }
    @keyframes bell-ring {
      0% { transform: rotate(0); }
      10% { transform: rotate(15deg); }
      20% { transform: rotate(-10deg); }
      30% { transform: rotate(5deg); }
      40% { transform: rotate(-5deg); }
      50% { transform: rotate(2deg); }
      60% { transform: rotate(-2deg); }
      70%, 100% { transform: rotate(0); }
    }
    .filter-row td {
      padding: 0.5rem;
      background-color: #f3f4f6;
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
    
    /* Grid de tarjetas responsivas */
    .opportunities-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 1rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 1024px) {
      .opportunities-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .opportunities-grid {
        grid-template-columns: 1fr;
      }
    }
    
    /* Estilos de tarjeta premium */
    .opportunity-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 250px;
    }
    .opportunity-card:hover {
      transform: translateY(-4px);
      border-color: #9ca3af;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .opportunity-card.selected {
      border-color: #10b981;
      background-color: #f0fdf4;
    }
    .card-select-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 10;
    }
    .card-select-overlay input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-right: 24px;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin: 0.5rem 0 1rem 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-transform: none;
    }
    .card-body-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
      background: #f9fafb;
      padding: 0.75rem;
      border-radius: 8px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .metric-label {
      color: #6b7280;
    }
    .metric-val {
      color: #111827;
    }
    .card-details-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      border-top: 1px solid #f3f4f6;
      padding-top: 0.75rem;
      margin-bottom: 1rem;
      color: #6b7280;
    }
    .details-left {
      display: flex;
      gap: 12px;
    }
    .card-actions-row {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    .btn-delete-card {
      background: none;
      border: 1px solid #fecaca;
      color: #ef4444;
      border-radius: 6px;
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .btn-delete-card:hover {
      background: #fee2e2;
    }
    
    /* Toggle switch styles */
    .view-toggle-group {
      display: inline-flex;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      overflow: hidden;
      background-color: white;
    }
    .view-toggle-btn {
      background: none;
      border: none;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      color: #4b5563;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .view-toggle-btn.active {
      background-color: #f3f4f6;
      color: #111827;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
    }
  `]
})
export class LicitacionListComponent implements OnInit {
  public licitacionService = inject(LicitacionService);
  private router = inject(Router);
  private authService = inject(AuthService);

  public isAdmin = computed(() => this.authService.isAdmin());

  ngOnInit(): void {
    this.licitacionService.getLicitaciones().subscribe();
  }

  // Filtering and Sorting state
  public viewMode = signal<'table' | 'cards'>('table');
  public searchTerm = signal('');
  public sortColumn = signal<string>('fecha_carga');
  public sortDirection = signal<'asc' | 'desc'>('desc');

  // Per-column filters
  public columnFilters = signal({
    tipo_licitacion: '',
    nombre: '',
    estado: ''
  });

  public readonly estados = [
    'PENDIENTE', 'PROCESANDO_DOCUMENTOS', 'DOCUMENTOS_PROCESADOS', 
    'ERROR_PROCESO_DOCUMENTAL', 'REQUIERE_REVISION_TECNICA',
    'EXTRACCION_SEMANTICA_EN_PROCESO', 'EXTRACCION_SEMANTICA_COMPLETADA',
    'HOMOLOGACION_EN_PROCESO', 'HOMOLOGACION_COMPLETADA', 'ERROR_EXTRACCION_SEMANTICA',
    'EN_ANALISIS', 'EN_PREPARACION_OFERTA', 'POSTULACION_ENVIADA',
    'OFERTA_PRESENTADA', 'EN_EVALUACION', 'ADJUDICADA', 'NO_ADJUDICADA',
    'DECLINADA', 'CERRADA'
  ];

  public optimisticDeletedIds = signal<Set<string>>(new Set());

  // Computed signal for the final list
  public filteredLicitaciones = computed(() => {
    let list = this.licitacionService.list()?.licitaciones || [];

    const deleted = this.optimisticDeletedIds();
    if (deleted.size > 0) {
        list = list.filter(item => !deleted.has(item.id));
    }

    // Global Filter
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(item => 
        item.nombre.toLowerCase().includes(term) ||
        (item.id_interno?.toString() || '').includes(term) ||
        item.estado.toLowerCase().includes(term) ||
        (item.tipo_licitacion || 'LICITACION').toLowerCase().includes(term)
      );
    }

    // Column Filters
    const filters = this.columnFilters();
    if (filters.tipo_licitacion) {
      list = list.filter(item => {
        const type = item.tipo_licitacion || 'LICITACION_PUBLICA';
        return type === filters.tipo_licitacion || (filters.tipo_licitacion === 'LICITACION' && type === 'LICITACION_PUBLICA');
      });
    }
    if (filters.nombre) {
      const n = filters.nombre.toLowerCase();
      list = list.filter(item => item.nombre.toLowerCase().includes(n));
    }
    if (filters.estado) {
      list = list.filter(item => item.estado === filters.estado);
    }

    // Sort
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return [...list].sort((a: any, b: any) => {
      let valA = a[col];
      let valB = b[col];

      // Handle nulls
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Unique names for datalist
  public uniqueNames = computed(() => {
    const list = this.licitacionService.list()?.licitaciones || [];
    return [...new Set(list.map(item => item.nombre))].sort();
  });

  public setViewMode(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  public updateColumnFilter(column: string, value: string): void {
    this.columnFilters.update(prev => ({ ...prev, [column]: value }));
  }

  public toggleSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  public getSortIcon(column: string): string {
    if (this.sortColumn() !== column) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }



    public deletingId: string | null = null;
    public deletingBulk = false;
    public deleteMessage: { text: string; type: 'success' | 'error' | 'info' } | null = null;
    public selectedIds: Set<string> = new Set();
    
    public confirmModal: { message: string, onConfirm: () => void, onCancel: () => void } | null = null;

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
        this.confirmModal = {
            message: `¿Estás seguro que deseas eliminar permanentemente la licitación '${nombre}'?`,
            onCancel: () => this.confirmModal = null,
            onConfirm: () => {
                this.confirmModal = null;
                this.executeDelete(id, nombre);
            }
        };
    }

    private executeDelete(id: string, nombre: string): void {
        this.deletingId = id;
        this.deleteMessage = null;

        this.licitacionService.deleteLicitacion(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.deleteMessage = { text: res.message || `Licitación '${nombre}' enviada a eliminar en segundo plano.`, type: 'info' };
                    // Optimistic update
                    this.optimisticDeletedIds.update(set => {
                        const newSet = new Set(set);
                        newSet.add(id);
                        return newSet;
                    });
                    this.selectedIds.delete(id);
                    // Polling / Refresco
                    setTimeout(() => {
                        this.licitacionService.getLicitaciones().subscribe();
                    }, 2000);
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
        
        this.confirmModal = {
            message: `¿Estás seguro que deseas eliminar permanentemente las ${count} licitaciones seleccionadas y todos sus recursos vinculados? Esta acción no se puede deshacer.`,
            onCancel: () => this.confirmModal = null,
            onConfirm: () => {
                this.confirmModal = null;
                this.executeBulkDelete(count);
            }
        };
    }

    private executeBulkDelete(count: number): void {
        this.deletingBulk = true;
        this.deleteMessage = { text: 'Iniciando eliminación...', type: 'info' }; 
        const idsArray = Array.from(this.selectedIds);
        
        console.log("🔥 [onBulkDelete] Enviando request a servicio bulkDeleteLicitaciones:", idsArray);

        this.licitacionService.bulkDeleteLicitaciones(idsArray).subscribe({
            next: (res) => {
                console.log("🔥 [onBulkDelete] Respuesta recibida HTTP:", res);
                if (res.success) {
                    this.deleteMessage = { text: res.message || `${count} licitaciones enviadas a eliminar en segundo plano.`, type: 'info' };
                    
                    // Optimistic update
                    this.optimisticDeletedIds.update(set => {
                        const newSet = new Set(set);
                        idsArray.forEach(id => newSet.add(id));
                        return newSet;
                    });
                    this.selectedIds.clear();

                    console.log("🔥 [onBulkDelete] Configurando refresh en 2 segundos...");
                    setTimeout(() => {
                        this.licitacionService.getLicitaciones().subscribe();
                    }, 2000); // Give background task time
                } else {
                    console.error("🔥 [onBulkDelete] Respuesta fallida logic:", res.message);
                    this.deleteMessage = { text: `Error en eliminación masiva: ${res.message}`, type: 'error' };
                }
                this.deletingBulk = false;
                setTimeout(() => this.deleteMessage = null, 5000);
            },
            error: (err) => {
                console.error("🔥 [onBulkDelete] Error Catch fatal en subscribe:", err);
                this.deleteMessage = { text: 'Ocurrió un error de red al intentar la eliminación masiva.', type: 'error' };
                this.deletingBulk = false;
                setTimeout(() => this.deleteMessage = null, 5000);
            }
        });
    }
}
