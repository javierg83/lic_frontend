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
  admin_username?: string; // Nuevo
  alerta_homologacion_umbral?: number;
  alerta_homologacion_activa?: boolean;
  correo_contacto?: string;
  // Para envío en creación
  admin_username_input?: string;
  admin_password_input?: string;
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

  createCliente(cliente: any): Observable<any> {
    // Adaptar nombres para el backend
    const body = {
      nombre: cliente.nombre,
      rut: cliente.rut,
      activo: cliente.activo,
      admin_username: cliente.admin_username_input,
      admin_password: cliente.admin_password_input
    };
    return this.http.post(`${this.apiUrl}/`, body);
  }

  getClienteDetail(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${clienteId}`);
  }

  updatePassword(username: string, password: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${username}/password`, { password });
  }

  createAdminUser(clienteId: string, user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${clienteId}/usuarios`, user);
  }

  updateConfiguracion(clienteId: string, config: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/clientes/${clienteId}/configuracion`, config);
  }
}
