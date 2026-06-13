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
  documentos_error: number;
  cantidad_items: number;
  transferida: boolean;
  macro_categoria?: string;
  subcategoria_1?: string;
  subcategoria_2?: string;
  estado_clasificacion?: string;
}

export interface CaStagingItem {
  id: string;
  codigo_compra_agil: string;
  titulo: string;
  organismo: string;
  estado_mp?: string;
  estado_staging: string;
  fecha_publicacion?: string;
  fecha_cierre?: string;
  region?: string;
  monto_estimado?: number;
  transferida: boolean;
  fecha_descarga?: string;
  macro_categoria?: string;
  subcategoria?: string;
  subcategoria_1?: string;
  subcategoria_2?: string;
  estado_clasificacion?: string;
  ai_model_used?: string;
  ai_tokens_input?: number;
  ai_tokens_output?: number;
  ai_costo_usd?: number;
  ai_costo_clp?: number;
  bulk_transfer_run_id?: string;
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

  getDownloadRuns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/descargas/runs`);
  }

  cancelDownloadRun(runId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/descargas/runs/${runId}/cancel`, {});
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

  deleteBulkStaging(ids: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/delete-bulk`, ids);
  }

  transferirBulkLicitacion(ids: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/transfer-bulk`, ids);
  }

  clearAllStaging(): Observable<any> {
    return this.http.post(`${this.API_URL}/staging/clear-all`, {});
  }

  // ==========================================
  // COMPRAS AGILES STAGING
  // ==========================================

  getCaCategorias(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/compras-agiles/categorias`);
  }

  getCaStagingList(params: any = {}): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/compras-agiles/staging`, { params });
  }

  getCaStagingById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/compras-agiles/staging/${id}`);
  }

  transferirCompraAgil(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/compras-agiles/staging/${id}/transferir`, {});
  }

  transferirBulkCompraAgil(ids: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/compras-agiles/staging/transfer-bulk`, ids);
  }

  descartarCompraAgil(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/compras-agiles/staging/${id}/descartar`, {});
  }

  deleteBulkCaStaging(ids: string[]): Observable<any> {
    return this.http.post(`${this.API_URL}/compras-agiles/staging/delete-bulk`, ids);
  }

  clearAllCaStaging(): Observable<any> {
    return this.http.post(`${this.API_URL}/compras-agiles/staging/clear-all`, {});
  }

  // ==========================================
  // CUADRATURA / RECONCILIACION
  // ==========================================

  triggerReconciliation(days: number | null): Observable<any> {
    return this.http.post(`${this.API_URL}/reconciliation/run`, { days });
  }

  getReconciliationRuns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/reconciliation/runs`);
  }
}
