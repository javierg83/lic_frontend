import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MercadoPublicoService, MpStagingItem, CaStagingItem } from '../services/mercado-publico';

@Component({
  selector: 'app-mp-staging-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mp-staging-list.html',
  styleUrls: ['./mp-staging-list.scss']
})
export class MpStagingListComponent implements OnInit {
  activeTab: 'licitaciones' | 'compras_agiles' = 'licitaciones';
  viewMode: 'table' | 'cards' = 'table';

  opportunities: MpStagingItem[] = [];
  caOpportunities: CaStagingItem[] = [];
  loading = true;
  error = '';
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  Math = Math; // Expose Math to template
  selectedIds: Set<string> = new Set<string>();
  
  // Filtros
  searchText = '';
  selectedEstado = '';
  filterFechaDesde = '';
  filterFechaHasta = '';
  filterFechaTipo: 'fecha_descarga' | 'fecha_publicacion' | 'fecha_cierre' = 'fecha_descarga';
  
  // Filtros Compras Ágiles
  selectedMacro = '';
  selectedSub = '';
  categoriasTree: any = {};
  macroOptions: string[] = [];
  subOptions: string[] = [];

  // Ordenamiento
  sortField = 'fecha_descarga';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private mpService: MercadoPublicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadData();
  }

  loadCategorias() {
    this.mpService.getCaCategorias().subscribe({
      next: (tree) => {
        this.categoriasTree = tree || {};
        this.macroOptions = Object.keys(this.categoriasTree);
      },
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  onMacroChange() {
    this.selectedSub = '';
    if (this.selectedMacro && this.categoriasTree[this.selectedMacro]) {
      this.subOptions = this.categoriasTree[this.selectedMacro];
    } else {
      this.subOptions = [];
    }
    this.loadData();
  }

  onSubChange() {
    this.loadData();
  }

  onEstadoChange() {
    this.loadData();
  }

  onSearch() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';
    this.selectedIds.clear();
    this.cdr.detectChanges();
    
    if (this.activeTab === 'licitaciones') {
      this.mpService.getStagingList().subscribe({
        next: (data) => {
          this.opportunities = data || [];
          this.totalItems = this.opportunities.length;
          this.currentPage = 1;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'No se pudieron cargar las licitaciones. Verifica la consola.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const params: any = {};
      if (this.searchText) params.search = this.searchText;
      if (this.selectedMacro) params.macro_categoria = this.selectedMacro;
      if (this.selectedSub) params.subcategoria = this.selectedSub;
      if (this.selectedEstado) params.estado_staging = this.selectedEstado;

      this.mpService.getCaStagingList(params).subscribe({
        next: (data) => {
          this.caOpportunities = data || [];
          this.totalItems = this.caOpportunities.length;
          this.currentPage = 1;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'No se pudieron cargar las compras ágiles. Verifica la consola.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  setTab(tab: 'licitaciones' | 'compras_agiles') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.loadData();
    }
  }

  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }


  // Selección
  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.cdr.detectChanges();
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.paginatedOpportunities.forEach(opp => this.selectedIds.add(opp.id));
    } else {
      this.paginatedOpportunities.forEach(opp => this.selectedIds.delete(opp.id));
    }
    this.cdr.detectChanges();
  }

  isAllSelected(): boolean {
    const pageItems = this.paginatedOpportunities;
    if (pageItems.length === 0) return false;
    return pageItems.every(opp => this.selectedIds.has(opp.id));
  }

  deleteSelected() {
    if (this.selectedIds.size === 0) return;
    
    const count = this.selectedIds.size;
    const tabName = this.activeTab === 'licitaciones' ? 'licitaciones' : 'compras ágiles';
    if (!confirm(`¿Estás seguro de que deseas eliminar ${count} ${tabName} de staging? Esta acción no se puede deshacer.`)) {
      return;
    }

    const idsArray = Array.from(this.selectedIds);
    this.loading = true;
    
    const request = this.activeTab === 'licitaciones' 
      ? this.mpService.deleteBulkStaging(idsArray)
      : this.mpService.deleteBulkCaStaging(idsArray);

    request.subscribe({
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
    const tabName = this.activeTab === 'licitaciones' ? 'licitaciones' : 'compras ágiles';
    if (!confirm(`¿Estás seguro de que deseas LIMPIAR TODA la bandeja de staging de ${tabName}? Se borrarán todos los registros.`)) {
      return;
    }

    this.loading = true;
    const request = this.activeTab === 'licitaciones'
      ? this.mpService.clearAllStaging()
      : this.mpService.clearAllCaStaging();

    request.subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al limpiar staging: ' + (err.error?.detail || err.message);
        this.loading = false;
      }
    });
  }

  onDateFilterChange() {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedEstado = '';
    this.selectedMacro = '';
    this.selectedSub = '';
    this.subOptions = [];
    this.filterFechaDesde = '';
    this.filterFechaHasta = '';
    this.filterFechaTipo = 'fecha_descarga';
    this.currentPage = 1;
    this.loadData();
  }

  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi-arrow-down-up text-muted';
    }
    return this.sortDirection === 'asc' ? 'bi-sort-up text-primary' : 'bi-sort-down text-primary';
  }

  get filteredOpportunities(): any[] {
    const items = this.activeTab === 'licitaciones' ? this.opportunities : this.caOpportunities;
    let filtered = [...items];

    // Filtro por texto (para Licitaciones, ya que Compras Ágiles se filtra en backend)
    if (this.activeTab === 'licitaciones' && this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter((opp: any) => {
        const code = opp.codigo_externo || '';
        const name = opp.nombre || '';
        const org = opp.comprador_nombre_organismo || opp.organismo || '';
        return code.toLowerCase().includes(searchLower) || 
               name.toLowerCase().includes(searchLower) ||
               org.toLowerCase().includes(searchLower);
      });
    }

    // Filtro por estado para Licitaciones (Compras Ágiles se filtra en backend)
    if (this.activeTab === 'licitaciones' && this.selectedEstado) {
      filtered = filtered.filter(opp => opp.estado_staging === this.selectedEstado);
    }

    // Filtro por rango de fechas
    if (this.filterFechaDesde || this.filterFechaHasta) {
      const desde = this.filterFechaDesde ? new Date(this.filterFechaDesde + 'T00:00:00') : null;
      const hasta = this.filterFechaHasta ? new Date(this.filterFechaHasta + 'T23:59:59') : null;

      filtered = filtered.filter((opp: any) => {
        const dateVal = opp[this.filterFechaTipo];
        if (!dateVal) return false;
        const oppDate = new Date(dateVal);
        
        if (desde && oppDate < desde) return false;
        if (hasta && oppDate > hasta) return false;
        return true;
      });
    }

    // Ordenamiento
    filtered.sort((a: any, b: any) => {
      const field = this.sortField;
      
      let valA: any;
      let valB: any;
      
      if (field === 'codigo_externo') {
        valA = a.codigo_externo || a.codigo_compra_agil;
        valB = b.codigo_externo || b.codigo_compra_agil;
      } else if (field === 'nombre') {
        valA = a.nombre || a.titulo;
        valB = b.nombre || b.titulo;
      } else {
        valA = a[field];
        valB = b[field];
      }

      if (valA === undefined || valA === null) return this.sortDirection === 'asc' ? -1 : 1;
      if (valB === undefined || valB === null) return this.sortDirection === 'asc' ? 1 : -1;

      if (field === 'fecha_descarga' || field === 'fecha_publicacion' || field === 'fecha_cierre') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return this.sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string') {
        return this.sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return this.sortDirection === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valB > valA ? 1 : -1);
      }
    });

    return filtered;
  }

  get paginatedOpportunities(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredOpportunities.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOpportunities.length / this.pageSize) || 1;
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
    if (estado === 'VALIDADA_STAGING' || estado === 'TRANSFERIDO') return 'badge-success';
    if (estado === 'REQUIERE_REVISION' || estado === 'DESCARGA_PENDIENTE') return 'badge-warning';
    if (estado === 'ERROR_DOCUMENTOS' || estado === 'DESCARTADA' || estado === 'DESCARTADO' || estado === 'ERROR_TRANSFERENCIA') return 'badge-danger';
    if (estado === 'LIBERADA_PARA_PROCESAMIENTO' || estado === 'EN_COLA_PROCESAMIENTO') return 'badge-info';
    if (estado === 'TRANSFERIDA_AL_SISTEMA') return 'badge-dark';
    return 'badge-primary'; // DEFAULT
  }

  transferSelectedLicitaciones() {
    if (this.selectedIds.size === 0) return;
    
    const count = this.selectedIds.size;
    if (!confirm(`¿Estás seguro de que deseas transferir las ${count} licitaciones seleccionadas al sistema principal?`)) {
      return;
    }

    const idsArray = Array.from(this.selectedIds);
    this.loading = true;
    
    this.mpService.transferirBulkLicitacion(idsArray).subscribe({
      next: (res) => {
        alert(res.mensaje || `Se han transferido ${count} licitaciones exitosamente.`);
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al transferir licitaciones: ' + (err.error?.detail || err.message);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Compras Ágiles Actions
  transferCa(id: string) {
    if (!confirm('¿Estás seguro de que deseas transferir esta Compra Ágil para su descarga profunda y procesamiento?')) {
      return;
    }
    
    this.loading = true;
    this.mpService.transferirCompraAgil(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al transferir Compra Ágil: ' + (err.error?.detail || err.message);
        this.loading = false;
      }
    });
  }

  transferSelectedCa() {
    if (this.selectedIds.size === 0) return;
    
    const count = this.selectedIds.size;
    if (!confirm(`¿Estás seguro de que deseas enviar a procesar ${count} Compras Ágiles seleccionadas? Pasarán al flujo automático en segundo plano.`)) {
      return;
    }

    const idsArray = Array.from(this.selectedIds);
    this.loading = true;
    
    this.mpService.transferirBulkCompraAgil(idsArray).subscribe({
      next: (res) => {
        alert(res.mensaje || `Se han encolado ${count} Compras Ágiles exitosamente.`);
        this.loadData();
      },
      error: (err) => {
        this.error = 'Error al procesar compras ágiles: ' + (err.error?.detail || err.message);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
