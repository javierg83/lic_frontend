import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GestionService } from '../../services/gestion.service';
import { GestionLicitacion, GestionDocumento } from '../../models/gestion.model';

@Component({
    selector: 'app-gestion-licitacion-card',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './gestion-licitacion-card.component.html',
    styleUrls: ['./gestion-licitacion-card.component.css']
})
export class GestionLicitacionCardComponent implements OnInit {
    @Input() licitacionId!: string;
    @Input() showTitle = true;

    private gestionService = inject(GestionService);

    public gestion = signal<GestionLicitacion | null>(null);
    public documentos = signal<GestionDocumento[]>([]);
    
    public loading = signal<boolean>(true);
    public loadingDocs = signal<boolean>(false);
    public error = signal<string | null>(null);

    // Form state
    public editForm = signal<Partial<GestionLicitacion>>({});
    public saving = signal<boolean>(false);

    // Upload state
    public selectedFiles = signal<File[]>([]);
    public uploadingFiles = signal<boolean>(false);

    // Notifications
    public notification = signal<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

    ngOnInit(): void {
        if (this.licitacionId) {
            this.fetchGestion();
        } else {
            this.error.set('ID de licitación no proporcionado');
            this.loading.set(false);
        }
    }

    fetchGestion(): void {
        this.loading.set(true);
        this.gestionService.getGestion(this.licitacionId).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.gestion.set(res.data);
                    this.editForm.set({ ...res.data });
                    this.fetchDocumentos(res.data.id);
                } else {
                    this.gestion.set(null);
                    // Leave default form mapping
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar gestión');
                this.loading.set(false);
            }
        });
    }

    fetchDocumentos(gestionId: string): void {
        this.loadingDocs.set(true);
        this.gestionService.getDocumentos(gestionId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.documentos.set(res.data);
                }
                this.loadingDocs.set(false);
            },
            error: () => {
                this.loadingDocs.set(false);
            }
        });
    }

    onFilesSelected(event: any): void {
        if (event.target.files) {
            const files = Array.from(event.target.files) as File[];
            this.selectedFiles.set([...this.selectedFiles(), ...files]);
        }
        // Reset the input value so the same file could be selected again if removed
        if (event.target) event.target.value = '';
    }

    removeSelectedFile(index: number): void {
        const files = [...this.selectedFiles()];
        files.splice(index, 1);
        this.selectedFiles.set(files);
    }

    async saveEdit(): Promise<void> {
        if (!this.licitacionId) {
            return;
        }

        this.saving.set(true);
        
        try {
            // First step: save management data
            const res = await new Promise<any>((resolve, reject) => {
                this.gestionService.updateGestion(this.licitacionId, this.editForm()).subscribe({
                    next: (val) => {
                        resolve(val);
                    },
                    error: (err) => {
                        reject(err);
                    }
                });
            });

            if (!res.success) {
                this.showNotification(res.message || 'Error al actualizar gestión', 'error');
                this.saving.set(false);
                return;
            }

            const gestionResult = res.data;
            this.gestion.set(gestionResult);
            this.editForm.set({ ...gestionResult });
            
            // Second step: Upload files if any
            const filesToUpload = this.selectedFiles();
            if (filesToUpload.length > 0) {
                this.uploadingFiles.set(true);
                let uploadSuccess = true;
                
                for (const file of filesToUpload) {
                    try {
                        const fileRes = await new Promise<any>((resolve, reject) => {
                            this.gestionService.uploadDocumento(gestionResult.id, { 
                                file: file, 
                                tipo_documento: 'OTRO',
                                observacion: 'Agregado al guardar gestión'
                            }).subscribe({
                                next: resolve,
                                error: reject
                            });
                        });
                        if (!fileRes.success) uploadSuccess = false;
                    } catch (e) {
                        uploadSuccess = false;
                    }
                }
                
                this.uploadingFiles.set(false);
                if (uploadSuccess) {
                    this.selectedFiles.set([]); // clear queue
                    this.showNotification('Gestión y archivos guardados correctamente', 'success');
                } else {
                    this.showNotification('Gestión guardada, pero hubo errores subiendo archivos', 'error');
                }
                // Refresh table
                this.fetchDocumentos(gestionResult.id);
            } else {
                this.showNotification('Gestión guardada correctamente', 'success');
            }
            
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.saving.set(false);
        }
    }

    deleteDocumento(doc: GestionDocumento): void {
        const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el archivo "${doc.nombre_archivo}"? Esta acción no se puede deshacer y liberará espacio en el servidor.`);
        
        if (confirmacion) {
            this.gestionService.deleteDocumento(doc.id).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showNotification('Documento eliminado correctamente', 'success');
                        // Refrescar listado
                        const currentGestion = this.gestion();
                        if (currentGestion) {
                            this.fetchDocumentos(currentGestion.id);
                        }
                    } else {
                        this.showNotification(res.message || 'Error al eliminar documento', 'error');
                    }
                },
                error: (err) => {
                    this.showNotification('Error de conexión al eliminar documento', 'error');
                }
            });
        }
    }

    private showNotification(message: string, type: 'success' | 'error'): void {
        this.notification.set({ message, type });
        setTimeout(() => {
            this.notification.set({ message: '', type: null });
        }, 5000);
    }
}
