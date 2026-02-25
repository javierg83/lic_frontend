export interface ProductoHomologado {
    codigo: string;
    nombre: string;
    descripcion?: string;
    stock_disponible?: number;
    ubicacion_stock?: string;
}

export interface CandidatoHomologacion {
    ranking: number;
    producto: ProductoHomologado;
    score_similitud: number;
    razonamiento: string;
}

export interface ResultadoHomologacion {
    homologacion_id: string;
    item_key: string;
    nombre_item: string;
    cantidad: number;
    descripcion_detectada: string;
    candidatos: CandidatoHomologacion[];
}
