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

  constructor(private mpService: MercadoPublicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';
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
