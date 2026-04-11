import { environment } from '../../../../environments/environment';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DemoShowApiResponse, DemoShowRequest, DemoShowResponse } from '../models/show.model';

@Injectable({ providedIn: 'root' })
export class DemoShowService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/demo/show`;

    // Signals para manejar el estado global de este feature
    private _item = signal<DemoShowResponse | null>(null);
    private _loading = signal<boolean>(false);

    // Exposición pública de solo lectura
    public item = this._item.asReadonly();
    public loading = this._loading.asReadonly();

    fetchShow(licitacion_id: number): void {
        this._loading.set(true);
        const request: DemoShowRequest = { licitacion_id };

        this.http.post<DemoShowApiResponse>(this.API_URL, request).subscribe({
            next: (res) => {
                if (res.success) {
                    this._item.set(res.data);
                }
            },
            error: (err) => {
                console.error('Error en el servicio demo show:', err);
            },
            complete: () => this._loading.set(false)
        });
    }

    clearItem(): void {
        this._item.set(null);
    }
}
