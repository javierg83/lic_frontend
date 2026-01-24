import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatosEconomicosService } from '../../services/datos-economicos.service';
import { DatosEconomicosResponse } from '../../models/datos-economicos.model';

@Component({
    selector: 'app-datos-economicos-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './datos-economicos-card.component.html',
    styleUrls: ['./datos-economicos-card.component.css']
})
export class DatosEconomicosCardComponent implements OnInit {
    @Input() licitacionId!: string;
    @Input() showTitle = true;
    @Input() showEditButton = true;

    private datosService = inject(DatosEconomicosService);

    public datos = signal<DatosEconomicosResponse | null>(null);
    public loading = signal<boolean>(true);
    public error = signal<string | null>(null);

    ngOnInit(): void {
        if (this.licitacionId) {
            this.fetchDatos();
        } else {
            this.error.set('ID de licitación no proporcionado');
            this.loading.set(false);
        }
    }

    fetchDatos(): void {
        this.datosService.getDatosEconomicos(this.licitacionId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.datos.set(res.data);
                } else {
                    this.error.set(res.message);
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar datos económicos');
                this.loading.set(false);
            }
        });
    }
}
