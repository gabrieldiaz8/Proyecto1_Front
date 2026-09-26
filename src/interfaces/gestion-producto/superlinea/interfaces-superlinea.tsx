// Shape real que devuelve el backend — NO incluye createdAt, updatedAt, usuarioCreatedId, etc.
export interface Superlinea {
  id: number;
  denominacion: string;
  observacion: string | null;
  deletedAt: string | null;
  sistema: number;
}

export interface DtoConsultarSuperlinea {
  data: Superlinea[];
  total: number;
}

export interface SelectSuperlinea {
  id: number;
  denominacion: string;
}
