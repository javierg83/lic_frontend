import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-tenant-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-config.component.html',
  styleUrls: ['./tenant-config.component.css']
})
export class TenantConfigComponent implements OnInit {
  selectedFile: File | null = null;
  isUploading = false;
  uploadSuccess = false;
  uploadError = '';

  keywords: string[] = [];
  newKeyword = '';
  isSavingKeywords = false;
  kwSuccess = false;

  private authService = inject(AuthService);
  private configService = inject(ConfigService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadPreferencias();
  }

  loadPreferencias(): void {
    const clienteId = this.authService.getClienteId();
    if (!clienteId) return;

    this.configService.getPreferencias(clienteId).subscribe({
      next: (res) => {
        if (res.success && res.data?.palabras_clave) {
          this.keywords = res.data.palabras_clave;
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        this.uploadError = 'El catálogo multicliente debe ser un archivo .CSV';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.uploadError = '';
      this.uploadSuccess = false;
    }
  }

  uploadFile(): void {
    const clienteId = this.authService.getClienteId();
    if (!this.selectedFile) {
      this.uploadError = 'Debes seleccionar un archivo CSV primero.';
      return;
    }
    if (!clienteId) {
      this.uploadError = 'Tu sesión no tiene un cliente asociado. Cierra sesión y vuelve a ingresar.';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    this.configService.uploadCatalogo(clienteId, this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        if (response.success) {
          this.uploadSuccess = true;
          this.selectedFile = null;
        } else {
          this.uploadError = response.message || 'Error desconocido';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadError = 'Error al subir catálogo: ' + (err?.error?.detail || err.message || 'Error desconocido');
        this.cdr.detectChanges();
      }
    });
  }

  addKeyword(): void {
    const kw = this.newKeyword.trim();
    if (kw && !this.keywords.includes(kw)) {
      this.keywords.push(kw);
      this.newKeyword = '';
    }
  }

  removeKeyword(kw: string): void {
    this.keywords = this.keywords.filter(k => k !== kw);
  }

  saveKeywords(): void {
    const clienteId = this.authService.getClienteId();
    if (!clienteId) {
      console.error('No hay cliente_id en sesión. Por favor cierra sesión y vuelve a ingresar.');
      return;
    }

    this.isSavingKeywords = true;
    this.kwSuccess = false;

    this.configService.updatePreferencias(clienteId, this.keywords).subscribe({
      next: (res) => {
        this.isSavingKeywords = false;
        if (res.success) {
          this.kwSuccess = true;
          setTimeout(() => this.kwSuccess = false, 3000);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingKeywords = false;
        console.error('Error guardando preferencias:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
