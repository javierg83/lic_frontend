import { environment } from '../../../../environments/environment';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, DemoListRequest, DemoListResponse } from '../models/list.model';

@Injectable({ providedIn: 'root' })
export class DemoListService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/demo/list`;

  // Signals para manejar el estado global de este feature
  private _items = signal<DemoListResponse[]>([]);
  private _loading = signal<boolean>(false);

  // Exposición pública de solo lectura
  public items = this._items.asReadonly();
  public loading = this._loading.asReadonly();

  fetchList(request: DemoListRequest = {}): void {
    this._loading.set(true);

    // El AuthInterceptor inyectado en appConfig adjuntará el token automáticamente
    this.http.post<ApiResponse<DemoListResponse[]>>(this.API_URL, request).subscribe({
      next: (res) => {
        if (res.success) {
          this._items.set(res.data);
        }
      },
      error: (err) => {
        console.error('Error en el servicio demo:', err);
      },
      complete: () => this._loading.set(false)
    });
  }
}
