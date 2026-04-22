import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  activo: boolean;
  created_at?: string;
  palabras_clave?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminClientesService {
  private apiUrl = `${environment.apiUrl}/clientes/admin`;
  private http = inject(HttpClient);

  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  createCliente(cliente: Partial<Cliente>): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, cliente);
  }

  getClienteDetail(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${clienteId}`);
  }
}
