import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8000/api/control-room';

    getResumen(): Observable<DashboardResponse> {
        return this.http.get<{ success: boolean, message: string, data: DashboardResponse }>(`${this.apiUrl}/resumen`)
            .pipe(
                map(response => {
                    console.log('Raw HTTP response:', response);
                    if (!response.success && !response.data) {
                        throw new Error(response.message || 'API returned success=false');
                    }
                    return response.data;
                })
            );
    }
}
