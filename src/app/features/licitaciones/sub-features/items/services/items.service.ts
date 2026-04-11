import { environment } from '../../../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiResponse } from '../../../models/licitacion.model';
import { ItemsLicitacionResponse, ItemLicitacion } from '../models/items.model';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    private http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/licitaciones`;

    getItems(id: string): Observable<ApiResponse<ItemsLicitacionResponse>> {
        return this.http.get<ApiResponse<ItemsLicitacionResponse>>(`${this.API_URL}/${id}/items`).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al obtener los ítems', data: null as any });
            })
        );
    }

    updateItem(itemId: string, data: Partial<ItemLicitacion>): Observable<ApiResponse<ItemLicitacion>> {
        return this.http.put<ApiResponse<ItemLicitacion>>(`${this.API_URL}/items/${itemId}`, data).pipe(
            catchError(err => {
                return of({ success: false, message: 'Error al actualizar el ítem', data: null as any });
            })
        );
    }
}
