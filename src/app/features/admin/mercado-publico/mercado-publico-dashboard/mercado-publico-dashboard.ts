import { Component, OnInit } from '@angular/core';
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

  constructor(private mpService: MercadoPublicoService) {}

  ngOnInit() {
    this.loadRecentRuns();
    // Refrescar cada 10 segundos para ver el progreso/estado
    setInterval(() => this.loadRecentRuns(), 10000);
  }

  loadRecentRuns() {
    this.mpService.getDownloadRuns().subscribe({
      next: (runs) => {
        this.recentRuns = runs.slice(0, 5); // Solo las últimas 5
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
}
