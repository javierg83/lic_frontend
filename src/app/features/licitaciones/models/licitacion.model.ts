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
    id_interno?: number;
    nombre: string;
    estado: string;
    fecha_carga: string;
    presupuesto?: number;
    moneda?: string;
    cantidad_items?: number;
    cantidad_con_candidatos?: number;
    porcentaje_cobertura?: number;
    cantidad_homologados?: number;
    porcentaje_homologacion?: number;
    alerta_homologacion?: boolean;
    umbral_homologacion?: number;
    tipo_licitacion?: string;
}

export interface LicitacionListResponse {
    licitaciones: LicitacionListItem[];
}

export interface ArchivoShow {
    id: string;
    id_interno: number;
    nombre_archivo_org: string;
    tipo_contenido?: string;
    peso_bytes?: number;
    estado_procesamiento: string;
    fecha_subida: string;
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
    tipo_licitacion?: string;
    fecha_carga: string;
    archivos: ArchivoShow[];
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
