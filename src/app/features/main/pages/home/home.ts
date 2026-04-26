import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  isDragging = false;
  nombre = localStorage.getItem('nombre_usuario') || '';

  constructor(
    private authService: AuthService
  ) { }

  onLogout() {
    this.authService.logout();
  }


}
