import { Component } from '@angular/core';
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
export class MercadoPublicoDashboard {
  fechaDesde = new Date().toISOString().split('T')[0];
  fechaHasta = new Date().toISOString().split('T')[0];
  limite = 5; // Por defecto probaremos con 5
  descargarAdjuntos = true;
  region = ''; // Agregado: Filtro por región
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private mpService: MercadoPublicoService) {}

  iniciarDescarga() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload: any = {
      fecha_desde: this.fechaDesde,
      fecha_hasta: this.fechaHasta,
      estados: ["Publicada"],
      limite: this.limite > 0 ? this.limite : null,
      descargar_adjuntos: this.descargarAdjuntos
    };
    
    if (this.region) {
      payload.regiones = [this.region];
    }

    this.mpService.executeDownload(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = '¡Trabajo enviado exitosamente! El Worker está descargando datos en segundo plano.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Hubo un error al iniciar la descarga. Revisa la consola o asegúrate de que el backend está corriendo.';
      }
    });
  }
}
