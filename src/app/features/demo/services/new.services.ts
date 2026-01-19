import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DemoNewRequest, DemoNewResponse } from '../models/new.model';
import { ApiResponse } from '../models/list.model';

@Injectable({ providedIn: 'root' })
export class DemoNewService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8000/demo/new';

    private _loading = signal<boolean>(false);
    private _message = signal<string | null>(null);
    private _error = signal<string | null>(null);

    public loading = this._loading.asReadonly();
    public message = this._message.asReadonly();
    public error = this._error.asReadonly();

    createNew(request: DemoNewRequest): void {
        this._loading.set(true);
        this._message.set(null);
        this._error.set(null);

        this.http.post<ApiResponse<any>>(this.API_URL, request).subscribe({
            next: (res) => {


                console.log(res);

                if (res.success) {
                    this._message.set(res.message || 'Registro creado exitosamente');
                } else {
                    this._error.set(res.error || 'Error al crear el registro');
                }
            },
            error: (err) => {
                console.error('Error en el servicio demo:', err);
                this._error.set('Error de conexión con el servidor');
            },
            complete: () => this._loading.set(false)
        });
    }

    resetState(): void {
        this._message.set(null);
        this._error.set(null);
    }
}
