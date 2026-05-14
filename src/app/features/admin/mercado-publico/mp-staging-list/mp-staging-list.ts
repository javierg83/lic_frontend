import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MercadoPublicoService, MpStagingItem } from '../services/mercado-publico';

@Component({
  selector: 'app-mp-staging-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mp-staging-list.html',
  styleUrls: ['./mp-staging-list.scss']
})
export class MpStagingListComponent implements OnInit {
  opportunities: MpStagingItem[] = [];
  loading = true;
  error = '';
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  Math = Math; // Expose Math to template
  selectedIds: Set<string> = new Set<string>();

  constructor(private mpService: MercadoPublicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';
    this.selectedIds.clear();
    this.cdr.detectChanges();
    
    this.mpService.getStagingList().subscribe({
      next: (data) => {
        this.opportunities = data || [];
        this.totalItems = this.opportunities.length;
        this.currentPage = 1;
        this.loading = false;
        console.log("Datos cargados exitosamente:", this.opportunities);
        this.cdr.detectChanges(); // FORZAR RENDERIZADO
      },
      error: (err) => {
        this.error = 'No se pudieron cargar las oportunidades de staging. Verifica la consola.';
        console.error("Error en HTTP GET staging:", err);
        this.loading = false;
        this.cdr.detectChanges(); // FORZAR RENDERIZADO
      }
    });
  }

  // Selección
  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.paginatedOpportunities.forEach(opp => this.selectedIds.add(opp.id));
    } else {
      this.paginatedOpportunities.forEach(opp => this.selectedIds.delete(opp.id));
    }
  }

  isAllSelected(): boolean {
    const pageItems = this.paginatedOpportunities;
    if (pageItems.length === 0) return false;
    return pageItems.every(opp => this.selectedIds.has(opp.id));
  }

  deleteSelected() {
    if (this.selectedIds.size === 0) return;
    
    const count = this.selectedIds.size;
    if (!confirm(`¿Estás seguro de que deseas eliminar ${count} registros de staging? Esta acción no se puede deshacer.`)) {
      return;
    }

    const idsArray = Array.from(this.selectedIds);
    this.loading = true;
    this.mpService.deleteBulkStaging(idsArray).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al eliminar registros: ' + (err.error?.detail || err.message);
        this.loading = false;
      }
    });
  }

  clearAll() {
    if (!confirm('¿Estás seguro de que deseas LIMPIAR TODA la bandeja de staging? Se borrarán todos los registros y el historial de descargas.')) {
      return;
    }

    this.loading = true;
    this.mpService.clearAllStaging().subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al limpiar staging: ' + (err.error?.detail || err.message);
        this.loading = false;
      }
    });
  }

  get paginatedOpportunities(): MpStagingItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.opportunities.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getEstadoClass(estado: string): string {
    if (!estado) return 'badge-primary';
    if (estado === 'VALIDADA_STAGING') return 'badge-success';
    if (estado === 'REQUIERE_REVISION') return 'badge-warning';
    if (estado === 'ERROR_DOCUMENTOS' || estado === 'DESCARTADA') return 'badge-danger';
    if (estado === 'LIBERADA_PARA_PROCESAMIENTO') return 'badge-info';
    if (estado === 'TRANSFERIDA_AL_SISTEMA') return 'badge-dark';
    return 'badge-primary'; // DEFAULT
  }
}
