export interface DemoNewRequest {
    nombre: string;
    telefono: string;
    fecha_nacimiento: string;
    edad: number;
}

export interface DemoNewResponse {
    success: boolean;
    message: string;
    data?: any;
}
