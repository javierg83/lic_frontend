import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, LicitacionNewResponse, LicitacionListResponse, LicitacionShowResponse } from '../models/licitacion.model';
import { map, catchError, of, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LicitacionService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8000/licitaciones';

    private _loading = signal<boolean>(false);
    private _response = signal<LicitacionNewResponse | null>(null);
    private _list = signal<LicitacionListResponse | null>(null);
    private _error = signal<string | null>(null);

    public loading = this._loading.asReadonly();
    public response = this._response.asReadonly();
    public list = this._list.asReadonly();
    public error = this._error.asReadonly();

    getLicitaciones(): Observable<ApiResponse<LicitacionListResponse>> {
        this._loading.set(true);
        this._error.set(null);

        return this.http.get<ApiResponse<LicitacionListResponse>>(`${this.API_URL}/list`).pipe(
            map(res => {
                if (res.success) {
                    this._list.set(res.data);
                } else {
                    this._error.set(res.message);
                }
                this._loading.set(false);
                return res;
            }),
            catchError(err => {
                this._error.set('Error de conexión o error interno del servidor');
                this._loading.set(false);
                return of({ success: false, message: 'Server Error', data: { licitaciones: [] } });
            })
        );
    }

    getLicitacion(id: string): Observable<ApiResponse<LicitacionShowResponse>> {
        return this.http.get<ApiResponse<LicitacionShowResponse>>(`${this.API_URL}/${id}`).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al obtener los detalles de la licitación', data: null as any });
            })
        );
    }


    createLicitacion(nombre: string, files: File[]) {
        this._loading.set(true);
        this._error.set(null);
        this._response.set(null);

        const formData = new FormData();
        formData.append('nombre', nombre);
        files.forEach(file => {
            formData.append('files', file, file.name);
        });

        return this.http.post<ApiResponse<LicitacionNewResponse>>(`${this.API_URL}/new`, formData).pipe(
            map(res => {
                if (res.success) {
                    this._response.set(res.data);
                    return res;
                } else {
                    this._response.set(res.data); // data contains validation details even on failure
                    this._error.set(res.message);
                    return res;
                }
            }),
            catchError(err => {
                this._error.set('Error de conexión o error interno del servidor');
                return of({ success: false, message: 'Server Error', data: null });
            })
        ).subscribe(() => this._loading.set(false));
    }

    resetState() {
        this._response.set(null);
        this._error.set(null);
    }
}
