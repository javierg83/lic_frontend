export interface GestionLicitacion {
    id: string;
    licitacion_id: string;
    estado: string;
    monto?: number;
    observaciones?: string;
    fecha_resultado?: string;
    fecha_cierre?: string;
    created_at: string;
    updated_at: string;
}

export interface GestionDocumento {
    id: string;
    gestion_id: string;
    tipo_documento: string;
    nombre_archivo: string;
    ruta_archivo: string;
    fecha_subida: string;
    usuario?: string;
    observacion?: string;
}
