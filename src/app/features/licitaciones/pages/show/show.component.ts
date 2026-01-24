import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LicitacionService } from '../../services/licitacion.service';
import { LicitacionShowResponse } from '../../models/licitacion.model';
import { DatosEconomicosCardComponent } from '../../sub-features/datos-economicos/components/datos-economicos-card/datos-economicos-card.component';

@Component({
    selector: 'app-licitacion-show',
    standalone: true,
    imports: [CommonModule, RouterModule, DatosEconomicosCardComponent],
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css']
})
export class LicitacionShowComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private licitacionService = inject(LicitacionService);

    public licitacion = signal<LicitacionShowResponse | null>(null);
    public loading = signal<boolean>(true);
    public error = signal<string | null>(null);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.fetchLicitacion(id);
        } else {
            this.error.set('ID de licitación no proporcionado');
            this.loading.set(false);
        }
    }

    fetchLicitacion(id: string): void {
        this.licitacionService.getLicitacion(id).subscribe({
            next: (res) => {
                if (res.success) {
                    this.licitacion.set(res.data);
                } else {
                    this.error.set(res.message);
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Error al cargar la licitación');
                this.loading.set(false);
            }
        });
    }
}
