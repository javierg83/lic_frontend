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
  saving = signal<boolean>(false);
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

  onSelectCandidato(homologacionIndex: number, candidatoId: string) {
    this.homologaciones.update(homols => {
      const updated = [...homols];
      updated[homologacionIndex].candidato_seleccionado_id = candidatoId;
      return updated;
    });
  }

  saveSelections() {
    this.saving.set(true);
    this.error.set(null);

    const selections: Record<string, string | null> = {};
    for (const item of this.homologaciones()) {
      selections[item.homologacion_id] = item.candidato_seleccionado_id || null;
    }

    this.http.post<any>(`http://localhost:8000/licitaciones/${this.licitacionId}/homologaciones/guardar`, { selecciones: selections })
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Homologaciones guardadas exitosamente.');
          } else {
            this.error.set(response.message || 'Error al guardar homologaciones');
          }
          this.saving.set(false);
        },
        error: (err) => {
          console.error("Error saving homologaciones", err);
          this.error.set('Error de conexión o datos no disponibles al guardar');
          this.saving.set(false);
        }
      });
  }
}

