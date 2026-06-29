import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MercadoPublicoService } from '../services/mercado-publico';

@Component({
  selector: 'app-mercado-publico-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mercado-publico-dashboard.html',
  styleUrls: ['./mercado-publico-dashboard.scss'],
})
export class MercadoPublicoDashboard implements OnInit {
  fechaDesde = new Date().toISOString().split('T')[0];
  fechaHasta = new Date().toISOString().split('T')[0];
  limite = 5;
  descargarAdjuntos = true;
  tipoExtraccion: 'licitaciones' | 'compras_agiles' = 'licitaciones';
  region = '';
  comuna = '';
  palabrasClave = '';
  loading = false;
  successMessage = '';
  errorMessage = '';
  recentRuns: any[] = [];

  constructor(private mpService: MercadoPublicoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadRecentRuns();
    // Refrescar cada 10 segundos para ver el progreso/estado
    setInterval(() => this.loadRecentRuns(), 10000);
  }

  loadRecentRuns() {
    this.mpService.getDownloadRuns().subscribe({
      next: (runs) => {
        this.recentRuns = runs.slice(0, 20); // Mostrar las últimas 20
        this.cdr.detectChanges();
      }
    });
  }

  iniciarDescarga() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: any = {
      fecha_desde: this.fechaDesde,
      fecha_hasta: this.fechaHasta,
      estados: ["Publicada"],
      limite: this.limite > 0 ? this.limite : null,
      descargar_adjuntos: this.tipoExtraccion === 'licitaciones' ? this.descargarAdjuntos : false,
      modo: this.tipoExtraccion === 'compras_agiles' ? 'scraping_compra_agil' : 'licitaciones'
    };
    
    if (this.region) {
      payload.regiones = [this.region];
    }
    
    if (this.comuna) {
      payload.comunas = [this.comuna];
    }
    
    if (this.palabrasClave) {
      payload.palabras_clave = this.palabrasClave.split(',').map(pk => pk.trim()).filter(pk => pk.length > 0);
    }

    this.mpService.executeDownload(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = '¡Trabajo enviado exitosamente! El Worker está descargando datos en segundo plano.';
        this.loadRecentRuns();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Hubo un error al iniciar la descarga. Revisa la consola o asegúrate de que el backend está corriendo.';
      }
    });
  }

  cancelarRun(runId: string) {
    if (confirm('¿Estás seguro de que deseas cancelar esta descarga?')) {
      this.mpService.cancelDownloadRun(runId).subscribe({
        next: () => {
          this.successMessage = 'Petición de cancelación enviada.';
          this.loadRecentRuns();
        }
      });
    }
  }

  isLicitacionRun(type: string): boolean {
    if (!type) return false;
    const t = type.toLowerCase();
    return t === 'licitaciones' || t === 'licitacion' || t === 'mercado_publico';
  }

  isCompraAgilRun(type: string): boolean {
    if (!type) return false;
    const t = type.toLowerCase();
    return t === 'scraping_compra_agil' || t === 'compras_agiles' || t === 'compra_agil';
  }

  isTransferRun(type: string): boolean {
    return false;
  }

  getRunTypeText(type: string): string {
    if (!type) return 'Desconocido';
    const t = type.toLowerCase();
    if (t === 'licitaciones' || t === 'licitacion' || t === 'mercado_publico') return 'Licitación';
    if (this.isCompraAgilRun(type)) return 'Compra Ágil';
    return type;
  }

  formatDateRange(run: any): string {
    if (!run.fecha_desde || !run.fecha_hasta) return '-';
    
    let dStr = typeof run.fecha_desde === 'string' ? run.fecha_desde : (run.fecha_desde.toISOString ? run.fecha_desde.toISOString() : '');
    let hStr = typeof run.fecha_hasta === 'string' ? run.fecha_hasta : (run.fecha_hasta.toISOString ? run.fecha_hasta.toISOString() : '');

    dStr = dStr.split('T')[0];
    hStr = hStr.split('T')[0];

    const dParts = dStr.split('-');
    const hParts = hStr.split('-');

    if (dParts.length === 3 && hParts.length === 3) {
      return `${dParts[2]}/${dParts[1]} al ${hParts[2]}/${hParts[1]}`;
    }
    return '-';
  }

  // Paginación
  currentPage = 1;
  pageSize = 5;

  get totalPages(): number {
    return Math.ceil(this.recentRuns.length / this.pageSize) || 1;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
