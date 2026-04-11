import { environment } from '../../../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiResponse } from '../../../models/licitacion.model';
import { GestionLicitacion, GestionDocumento } from '../models/gestion.model';

@Injectable({ providedIn: 'root' })
export class GestionService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/licitaciones`;

    getGestion(id: string): Observable<ApiResponse<GestionLicitacion>> {
        return this.http.get<ApiResponse<GestionLicitacion>>(`${this.API_URL}/${id}/gestion`).pipe(
            catchError(err => of({ success: false, message: 'Error al obtener gestión de licitación', data: null as any }))
        );
    }

    updateGestion(id: string, data: Partial<GestionLicitacion>): Observable<ApiResponse<GestionLicitacion>> {
        return this.http.post<ApiResponse<GestionLicitacion>>(`${this.API_URL}/${id}/gestion`, data).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al actualizar gestión de licitación', data: null as any });
            })
        );
    }

    getDocumentos(gestionId: string): Observable<ApiResponse<GestionDocumento[]>> {
        return this.http.get<ApiResponse<GestionDocumento[]>>(`${this.API_URL}/gestion/${gestionId}/documentos`).pipe(
            catchError(err => of({ success: false, message: 'Error al obtener documentos', data: [] }))
        );
    }

    uploadDocumento(gestionId: string, docData: { file: File, tipo_documento: string, observacion?: string }): Observable<ApiResponse<GestionDocumento>> {
        const formData = new FormData();
        formData.append('file', docData.file);
        formData.append('tipo_documento', docData.tipo_documento);
        if (docData.observacion) {
            formData.append('observacion', docData.observacion);
        }
        return this.http.post<ApiResponse<GestionDocumento>>(`${this.API_URL}/gestion/${gestionId}/documentos`, formData).pipe(
            catchError(err => of({ success: false, message: 'Error al subir documento', data: null as any }))
        );
    }

    deleteDocumento(documentoId: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.API_URL}/gestion/documentos/${documentoId}`).pipe(
            catchError(err => of({ success: false, message: 'Error al eliminar documento', data: null }))
        );
    }
}
