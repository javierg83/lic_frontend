import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MercadoPublicoService, MpStagingItem, MpDocumento, MpItem, MpEvento } from '../services/mercado-publico';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-mp-staging-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mp-staging-detail.html',
  styleUrl: './mp-staging-detail.scss',
})
export class MpStagingDetail implements OnInit {
  id: string = '';
  licitacion: MpStagingItem | null = null;
  documentos: MpDocumento[] = [];
  items: MpItem[] = [];
  eventos: MpEvento[] = [];
  loading = true;
  error: string | null = null;
  activeTab: 'general' | 'documentos' | 'items' | 'eventos' = 'general';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mpService: MercadoPublicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id') || '';
      if (this.id) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    // 1. Cargar la licitación principal
    this.mpService.getStagingById(this.id).subscribe({
      next: (lic) => {
        if (!lic) {
          this.error = 'No se pudo cargar la información principal de la licitación.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.licitacion = lic;
        this.loading = false; // Ya podemos mostrar la UI principal
        this.cdr.detectChanges();

        // 2. Cargar documentos, ítems y eventos de forma independiente
        this.mpService.getDocuments(this.id).subscribe({
          next: (docs) => { this.documentos = docs || []; this.cdr.detectChanges(); },
          error: (err) => { console.error('Error docs:', err); this.documentos = []; }
        });

        this.mpService.getItems(this.id).subscribe({
          next: (items) => { this.items = items || []; this.cdr.detectChanges(); },
          error: (err) => { console.error('Error items:', err); this.items = []; }
        });

        this.mpService.getEvents(this.id).subscribe({
          next: (eventos) => { this.eventos = eventos || []; this.cdr.detectChanges(); },
          error: (err) => { console.error('Error eventos:', err); this.eventos = []; }
        });

      },
      error: (err) => {
        console.error('Error cargando licitacion', err);
        this.error = 'Ocurrió un error inesperado al cargar la información principal.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'general' | 'documentos' | 'items' | 'eventos'): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/admin/mercado-publico/staging']);
  }

  validarLicitacion(): void {
    if (!this.id) return;
    this.loading = true;
    this.cdr.detectChanges();
    this.mpService.validarLicitacion(this.id).subscribe({
      next: (res) => {
        console.log('Validación exitosa:', res.mensaje);
        this.loadData();
      },
      error: (err) => {
        console.error('Error al validar:', err);
        this.error = 'Ocurrió un error al validar la licitación. ' + (err.error?.detail || '');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  transferirLicitacion(): void {
    if (!this.id) return;
    if (!confirm('¿Estás seguro de que deseas transferir esta licitación al sistema principal? Esto desencadenará el análisis semántico.')) return;
    
    this.loading = true;
    this.cdr.detectChanges();
    
    const payload = {
      mp_licitacion_staging_id: this.id,
      activar_pipeline_documental: true
    };
    
    this.mpService.transferirLicitacion(this.id, payload).subscribe({
      next: (res) => {
        console.log('Transferencia exitosa:', res.mensaje);
        this.loadData(); // Se actualizará el estado a TRANSFERIDO
      },
      error: (err) => {
        console.error('Error al transferir:', err);
        // Extract the actual error message from FastAPI's 422 validation details if present
        let errorMessage = err.error?.detail || '';
        if (Array.isArray(errorMessage)) {
           errorMessage = JSON.stringify(errorMessage);
        }
        this.error = 'Ocurrió un error al transferir la licitación. ' + errorMessage;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  reintentarDescargas(): void {
    if (!this.id) return;
    this.loading = true;
    this.cdr.detectChanges();
    this.mpService.reintentarDocumentos(this.id).subscribe({
      next: (res) => {
        console.log('Petición enviada:', res.message);
        // Esperamos un momento para que el worker procese la petición antes de recargar la vista
        setTimeout(() => this.loadData(), 2000);
      },
      error: (err) => {
        console.error('Error al reintentar descargas:', err);
        this.error = 'Ocurrió un error al enviar la petición de descarga.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  scrapeDocumentos(): void {
    if (!this.id) return;
    this.loading = true;
    this.cdr.detectChanges();
    this.mpService.scrapeDocumentos(this.id).subscribe({
      next: (res) => {
        console.log('Scraping encolado:', res.message);
        alert('Scraping encolado exitosamente. El Worker navegará Mercado Público para buscar documentos. Esto puede tardar unos segundos.');
        setTimeout(() => this.loadData(), 5000);
      },
      error: (err) => {
        console.error('Error al solicitar scraping:', err);
        this.error = 'Ocurrió un error al enviar la petición de scraping.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
