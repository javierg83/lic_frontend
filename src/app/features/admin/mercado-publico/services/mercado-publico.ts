import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface MpStagingItem {
  id: string;
  codigo_externo: string;
  nombre: string;
  estado_mp: string;
  fecha_publicacion?: string;
  fecha_cierre: string;
  fecha_descarga?: string;
  region: string;
  estado_staging: string;
  tiene_documentos: boolean;
  documentos_descargados: number;
  cantidad_items: number;
  transferida: boolean;
}

export interface MpDocumento {
  id: string;
  nombre: string;
  url: string;
  estado_descarga: string;
  archivo_path: string;
  created_at: string;
}

export interface MpItem {
  id: string;
  correlativo: number;
  linea: number;
  codigo_producto: string;
  nombre_producto: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
}

export interface MpEvento {
  id: string;
  nivel: string;
  mensaje: string;
  detalles: any;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class MercadoPublicoService {
  private API_URL = `${environment.apiUrl}/api/admin/mercado-publico`;

  constructor(private http: HttpClient) {}

  getStagingList(): Observable<MpStagingItem[]> {
    return this.http.get<MpStagingItem[]>(`${this.API_URL}/staging`);
  }

  getStagingById(id: string): Observable<MpStagingItem> {
    return this.http.get<MpStagingItem>(`${this.API_URL}/staging/${id}`);
  }

  getDocuments(id: string): Observable<MpDocumento[]> {
    return this.http.get<MpDocumento[]>(`${this.API_URL}/staging/${id}/documentos`);
  }

  getItems(id: string): Observable<MpItem[]> {
    return this.http.get<MpItem[]>(`${this.API_URL}/staging/${id}/items`);
  }

  getEvents(id: string): Observable<MpEvento[]> {
    return this.http.get<MpEvento[]>(`${this.API_URL}/staging/${id}/eventos`);
  }

  executeDownload(payload: any): Observable<any> {
    return this.http.post(`${this.API_URL}/descargas/run`, payload);
  }

  validarLicitacion(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/${id}/validar`, {});
  }

  transferirLicitacion(id: string, payload: any = {}): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/${id}/transferir`, payload);
  }

  descartarLicitacion(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/${id}/descartar`, {});
  }

  reintentarDocumentos(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/${id}/reintentar-documentos`, {});
  }

  scrapeDocumentos(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/${id}/scrape-documentos`, {});
  }
}
