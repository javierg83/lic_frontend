export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error?: string;
}

export interface FileValidationResult {
    nombre: string;
    valido: boolean;
    error?: string;
}

export interface LicitacionNewResponse {
    id?: string;
    nombre: string;
    archivos_procesados: FileValidationResult[];
}

export interface LicitacionListItem {
    id: string;
    nombre: string;
    estado: string;
    fecha_carga: string;
    presupuesto?: number;
    moneda?: string;
}

export interface LicitacionListResponse {
    licitaciones: LicitacionListItem[];
}

export interface LicitacionShowResponse {
    id: string;
    codigo: string;
    titulo: string;
    organismo: string;
    unidad_solicitante: string;
    descripcion: string;
    estado: string;
    estado_publicacion?: string;
    fecha_carga: string;
}

export interface FuenteDoc {
    documento?: string;
    pagina?: number;
    parrafo?: string;
    redis_key?: string;
}

export interface AuditoriaItem {
    id: string;
    licitacion_id: string;
    semantic_run_id?: string;
    concepto: string;
    campo_extraido: string;
    valor_extraido?: string;
    razonamiento?: string;
    lista_fuentes?: FuenteDoc[];
    creado_en: string;
}

export interface AuditoriaListResponse {
    data: AuditoriaItem[];
}
