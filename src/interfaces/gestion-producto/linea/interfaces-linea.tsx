import { SelectSublinea } from "../sublinea/interfaces-sublinea";

export interface Linea {
  id: number;
  denominacion: string;
  observacion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  usuarioCreatedId: number;
  usuarioUpdatedId: number;
  // El backend devuelve superLineaId (número) y opcionalmente superLineaDenominacion
  superLineaId: number;
  superLineaDenominacion?: string;
  sublineas: SelectSublinea[];
  sistema: number;
  stockMinimo: number | null;
  utilizaStockMinimo: boolean | null;
  porcentajeOcasional: number;
  porcentajeMayorista: number;
  porcentajeCliente: number;
}

export interface DtoConsultarLinea {
  data: ConsultarLinea[];
  total: number;
}

export interface ConsultarLinea {
  id: number;
  denominacion: string;
}

export interface SelectLinea {
  id: number;
  denominacion: string;
}
