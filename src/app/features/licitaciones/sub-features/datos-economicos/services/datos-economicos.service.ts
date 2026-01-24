import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiResponse } from '../../../models/licitacion.model'; // ApiResponse sigue siendo global/compartido
import { DatosEconomicosResponse } from '../models/datos-economicos.model';

@Injectable({ providedIn: 'root' })
export class DatosEconomicosService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8000/licitaciones';

    getDatosEconomicos(id: string): Observable<ApiResponse<DatosEconomicosResponse>> {
        return this.http.get<ApiResponse<DatosEconomicosResponse>>(`${this.API_URL}/${id}/datos-economicos`).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al obtener los datos económicos', data: null as any });
            })
        );
    }

    updateDatosEconomicos(id: string, data: Partial<DatosEconomicosResponse>): Observable<ApiResponse<DatosEconomicosResponse>> {
        return this.http.put<ApiResponse<DatosEconomicosResponse>>(`${this.API_URL}/${id}/datos-economicos`, data).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al actualizar los datos económicos', data: null as any });
            })
        );
    }
}
