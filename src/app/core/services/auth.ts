import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient, private router: Router) {}

  login(user: string, pass: string): Observable<any> {
    const body = {
      username: user,
      password: pass
    };

    return this.http.post<any>(this.API_URL, body).pipe(
      tap(res => {
        const payload = res?.data ?? res; // Compatibilidad: soporta ApiResponse envelope y respuesta directa
        if (payload?.access_token) {
          localStorage.setItem('token', payload.access_token);
          if (payload?.nombre_usuario) {
            localStorage.setItem('nombre_usuario', payload.nombre_usuario);
          }
          if (payload?.rol) {
            localStorage.setItem('rol', payload.rol);
          }
          if (payload?.cliente_id) {
            localStorage.setItem('cliente_id', payload.cliente_id);
          }
        }
      })
    );
  }

  getClienteId(): string | null {
    return localStorage.getItem('cliente_id');
  }

isLogged(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expired = payload.exp * 1000 < Date.now();
    return !expired;
  } catch (e) {
    return false;
  }
}


  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre_usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('cliente_id');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    const rol = localStorage.getItem('rol');
    return rol === 'admin';
  }
}
