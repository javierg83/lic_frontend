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
    fecha_carga: string;
}

