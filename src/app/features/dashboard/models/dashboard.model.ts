export interface KPIs {
    licitaciones_cargadas: number;
    licitaciones_en_proceso: number;
    licitaciones_adjudicadas: number;
    presupuesto_total: number;
    monto_adjudicado_total: number;
}

export interface UsuarioStats {
    cargadas: number;
    adjudicadas: number;
    monto_adjudicado: number;
    total_items: number;
    items_adjudicados: number;
    porcentaje_licitaciones: number;
    porcentaje_items: number;
}

export interface MetricasFinancieras {
    monto_postulado: number;
    monto_adjudicado: number;
    monto_perdido: number;
    monto_en_evaluacion: number;
    win_rate: number;
}

export interface DashboardResponse {
    kpis: KPIs;
    distribucion_estados: { [key: string]: number };
    metricas_financieras: MetricasFinancieras;
    por_usuario: { [key: string]: UsuarioStats };
    uso_mensual: { [key: string]: number };
    items_mas_cotizados: [string, number][];
    items_mas_adjudicados: [string, number][];
    licitaciones: any[];
}
