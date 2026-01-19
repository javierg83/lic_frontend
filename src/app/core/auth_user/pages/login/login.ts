
// ----------------------------------------------------------------------------
// SERVICE
// ----------------------------------------------------------------------------


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = 'http://localhost:8000/auth/login';

  constructor(private http: HttpClient, private router: Router) { }

  login(user: string, pass: string): Observable<any> {
    const body = {
      username: user = 'usuario',
      password: pass = 'password'
    };

    return this.http.post<any>(this.API_URL, body).pipe(
      map(res => {
        // Si el backend responde con success: false, lanzamos el mensaje de error
        if (res && res.success === false) {
          throw res.message || 'Error en el inicio de sesión';
        }
        return res;
      }),
      tap(res => {
        console.log('Login Response:', res);
        const data = res?.data;
        if (data?.access_token) {
          localStorage.setItem('token', data.access_token);
          if (data?.nombre_usuario) {
            localStorage.setItem('nombre_usuario', data.nombre_usuario);
          }
        }
      })
    );
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
    this.router.navigate(['/login']);
  }
}

// ----------------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------------


import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = 'usuario@ejemplo.com';
  password = 'password';
  error = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  login() {
    this.error.set(null);
    this.loading.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/main']);
      },
      error: (err) => {
        this.loading.set(false);
        // Intentamos usar el mensaje que viene del backend o uno genérico
        const errorMessage = typeof err === 'string' ? err : 'Credenciales inválidas';
        this.error.set(errorMessage);
        console.error('Login Error:', err);
      }
    });
  }
}
