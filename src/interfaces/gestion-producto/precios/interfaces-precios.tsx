export interface ImportacionPrecioProducto {
  denominacion: string;
  precioOriginal: number;
  nuevoPrecio: number;
}

// CR-006: Actualización masiva de precios
export interface AjustePreciosMasivoPayload {
  tipoAjuste: "AUMENTO" | "DISMINUCION";
  modalidad: "PORCENTAJE" | "MONTO";
  valor: number;
  alcance: "GLOBAL" | "LINEA";
  lineaId?: number;
}

export interface ProductoExcluido {
  id: number;
  denominacion: string;
  motivo: string;
}

export interface AjustePreciosMasivoResponse {
  totalProcesados: number;
  actualizadosExitosamente: number;
  excluidos: ProductoExcluido[];
}
