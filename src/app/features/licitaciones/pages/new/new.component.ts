import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicitacionService } from '../../services/licitacion.service';

@Component({
    selector: 'app-licitacion-new',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './new.component.html',
})
export class LicitacionNewComponent {
    private licitacionService = inject(LicitacionService);

    nombre = signal<string>('');
    selectedFiles = signal<File[]>([]);
    isDragOver = signal<boolean>(false);

    // Variables para Compra Ágil
    activeTab = signal<'manual' | 'agil'>('manual');
    importUrlUrlOrCode = signal<string>('');

    loading = this.licitacionService.loading;
    response = this.licitacionService.response;
    error = this.licitacionService.error;

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(true);
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);

        if (event.dataTransfer?.files) {
            this.handleFiles(event.dataTransfer.files);
        }
    }

    onFileSelected(event: any) {
        if (event.target.files) {
            this.handleFiles(event.target.files);
        }
    }

    private handleFiles(fileList: FileList) {
        const currentFiles = this.selectedFiles();
        const newFiles = Array.from(fileList);

        // Simple frontend check for obvious duplicates by name
        const uniqueNewFiles = newFiles.filter(nf => !currentFiles.some(cf => cf.name === nf.name));
        this.selectedFiles.set([...currentFiles, ...uniqueNewFiles]);
    }

    removeFile(index: number) {
        const current = this.selectedFiles();
        current.splice(index, 1);
        this.selectedFiles.set([...current]);
    }

    onSubmit() {
        if (!this.nombre() || this.selectedFiles().length === 0) return;
        this.licitacionService.createLicitacion(this.nombre(), this.selectedFiles());
    }

    onSubmitImport() {
        if (!this.importUrlUrlOrCode().trim()) return;
        this.licitacionService.importCompraAgil(this.importUrlUrlOrCode());
    }

    getFileError(fileName: string): string | undefined {
        const res = this.response();
        if (!res) return undefined;
        const fileRes = res.archivos_procesados.find(f => f.nombre === fileName);
        return fileRes?.valido ? undefined : fileRes?.error;
    }
}
