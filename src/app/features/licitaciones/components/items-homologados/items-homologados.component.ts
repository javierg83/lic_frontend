import { Component, Input, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ResultadoHomologacion } from '../../models/homologacion.model';

@Component({
  selector: 'app-items-homologados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './items-homologados.component.html',
  styleUrl: './items-homologados.component.scss'
})
export class ItemsHomologadosComponent {
  @Input() licitacionId!: string;

  homologaciones = signal<ResultadoHomologacion[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);

  constructor() {
    effect(() => {
      if (this.licitacionId) {
        this.loadHomologaciones();
      }
    });
  }

  loadHomologaciones() {
    this.loading.set(true);
    this.error.set(null);

    // Endpoint for homologations: GET /licitaciones/{id}/homologaciones
    this.http.get<any>(`http://localhost:8000/licitaciones/${this.licitacionId}/homologaciones`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Backend returns: { success: true, data: { homologaciones: [...] } }
            this.homologaciones.set(response.data?.homologaciones || []);
          } else {
            this.error.set(response.message || 'Error al cargar homologaciones');
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error("Error fetching homologaciones", err);
          this.error.set('Error de conexión o datos no disponibles');
          this.loading.set(false);
        }
      });
  }
}

