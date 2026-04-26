import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class NavbarComponent {

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  get userName(): string {
    return this.auth.getNombreUsuario() || 'Usuario';
  }

  get companyName(): string {
    return this.auth.getNombreEmpresa() || 'Licitaciones IA';
  }

  logout() {
    this.auth.logout();
  }

}
