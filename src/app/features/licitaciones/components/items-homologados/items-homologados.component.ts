import { environment } from '../../../../../environments/environment';
import { Component, Input, signal, effect, inject, computed } from '@angular/core';
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

  // Pagination
  public pageSize = signal<number>(20);
  public currentPage = signal<number>(1);

  public totalPages = computed(() => {
    return Math.ceil(this.homologaciones().length / this.pageSize()) || 1;
  });

  public paginatedHomologaciones = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + Number(this.pageSize());
    return this.homologaciones().slice(start, end);
  });

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
    this.http.get<any>(`${environment.apiUrl}/licitaciones/${this.licitacionId}/homologaciones`)
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

    this.http.post<any>(`${environment.apiUrl}/licitaciones/${this.licitacionId}/homologaciones/guardar`, { selecciones: selections })
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onChangePageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.currentPage.set(1);
  }
}

