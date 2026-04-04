import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigPageComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadSuccess = false;
  uploadError = '';

  constructor(
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        this.uploadError = 'El archivo debe ser un Excel (.xls o .xlsx)';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.uploadError = '';
      this.uploadSuccess = false;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    this.configService.uploadCatalogo(this.selectedFile).subscribe({
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
        this.uploadError = 'Error de conexión con el backend: ' + err.message;
        this.cdr.detectChanges();
      }
    });
  }
}
