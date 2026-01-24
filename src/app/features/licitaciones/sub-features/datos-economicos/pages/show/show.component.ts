import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DatosEconomicosService } from '../../services/datos-economicos.service';
import { DatosEconomicosResponse } from '../../models/datos-economicos.model';

@Component({
    selector: 'app-datos-economicos-show',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css']
})
export class DatosEconomicosShowComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private licitacionService = inject(DatosEconomicosService);

    public datos = signal<DatosEconomicosResponse | null>(null);
    public loading = signal<boolean>(true);
    public error = signal<string | null>(null);

    ngOnInit(): void {
        // Al ser una página de ruta /licitaciones/:id/datos-economicos
        // el :id está en el padre o podemos obtenerlo del paramMap si las rutas están configuradas para ello
        const id = this.route.parent?.snapshot.paramMap.get('id');

        if (id) {
            this.fetchDatosEconomicos(id);
        } else {
            this.error.set('ID de licitación no encontrado en la ruta');
            this.loading.set(false);
        }
    }

    fetchDatosEconomicos(id: string): void {
        this.licitacionService.getDatosEconomicos(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.datos.set(res.data);
                } else {
                    this.error.set(res.message);
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Error al cargar los datos económicos');
                this.loading.set(false);
            }
        });
    }
}
