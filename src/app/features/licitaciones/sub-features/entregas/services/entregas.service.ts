import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiResponse } from '../../../models/licitacion.model';
import { EntregaResponse } from '../models/entregas.model';

@Injectable({ providedIn: 'root' })
export class EntregasService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8000/licitaciones';

    getEntregas(id: string): Observable<ApiResponse<EntregaResponse>> {
        return this.http.get<ApiResponse<EntregaResponse>>(`${this.API_URL}/${id}/entregas`).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al obtener los datos de entrega', data: null as any });
            })
        );
    }

    updateEntregas(id: string, data: Partial<EntregaResponse>): Observable<ApiResponse<EntregaResponse>> {
        return this.http.put<ApiResponse<EntregaResponse>>(`${this.API_URL}/${id}/entregas`, data).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al actualizar los datos de entrega', data: null as any });
            })
        );
    }
}
