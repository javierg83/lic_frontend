import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatosEconomicosService } from '../../services/datos-economicos.service';
import { DatosEconomicosResponse } from '../../models/datos-economicos.model';

@Component({
  selector: 'app-datos-economicos-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class DatosEconomicosEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private datosService = inject(DatosEconomicosService);

  public licitacionId = signal<string | null>(null);
  public formData = signal<Partial<DatosEconomicosResponse>>({});
  public loading = signal<boolean>(true);
  public saving = signal<boolean>(false);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.parent?.snapshot.paramMap.get('id') ?? null;
    this.licitacionId.set(id);

    if (id) {
      this.fetchDatos(id);
    } else {
      this.error.set('ID de licitación no encontrado');
      this.loading.set(false);
    }
  }

  fetchDatos(id: string): void {
    this.datosService.getDatosEconomicos(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.formData.set({ ...res.data });
        } else {
          this.error.set(res.message);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar datos para editar');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    const id = this.licitacionId();
    if (!id) return;

    this.saving.set(true);
    this.datosService.updateDatosEconomicos(id, this.formData()).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['../'], { relativeTo: this.route });
        } else {
          this.error.set(res.message);
        }
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Error al guardar los cambios');
        this.saving.set(false);
      }
    });
  }
}
