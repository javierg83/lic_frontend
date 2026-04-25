import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  uploadCatalogo(clienteId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${clienteId}/productos/upload_csv`, formData);
  }

  getPreferencias(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${clienteId}/preferencias`);
  }

  updatePreferencias(clienteId: string, keywords: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clienteId}/preferencias`, { palabras_clave: keywords });
  }

  getConfiguracion(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${clienteId}/configuracion`);
  }

  updateConfiguracion(clienteId: string, config: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${clienteId}/configuracion`, config);
  }
}
