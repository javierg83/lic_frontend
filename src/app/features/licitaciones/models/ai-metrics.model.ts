export interface AITokenUsageResponse {
    id: number;
    licitacion_id: string;
    action: string;
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    created_at: string;
}

export interface AIMetricsSummary {
    action: string;
    provider: string;
    model: string;
    total_input: number;
    total_output: number;
    total_tokens: number;
}

export interface AIMetricsResponse {
    licitacion_id: string;
    logs: AITokenUsageResponse[];
    summary: AIMetricsSummary[];
    total_input_all: number;
    total_output_all: number;
    total_all: number;
}
