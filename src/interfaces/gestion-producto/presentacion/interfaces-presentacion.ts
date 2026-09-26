// CR-002: Presentación del producto — Value Object (cantidad + unidad de medida).
// Espejo de Proyecto1_Back: producto/domain/enums/unidad-medida.enum.ts
// y producto/domain/value-objects/presentacion.vo.ts
export const UnidadMedida = {
  KG: "KG",
  G: "G",
  L: "L",
  ML: "ML",
  UN: "UN",
  CC: "CC",
  LT: "LT",
  MG: "MG",
} as const;

export type UnidadMedida = (typeof UnidadMedida)[keyof typeof UnidadMedida];

export const UNIDADES_MEDIDA: { value: UnidadMedida; label: string }[] = [
  { value: UnidadMedida.UN, label: "Unidad (UN)" },
  { value: UnidadMedida.L, label: "Litro (L)" },
  { value: UnidadMedida.ML, label: "Mililitro (ML)" },
  { value: UnidadMedida.CC, label: "Centímetro cúbico (CC)" },
  { value: UnidadMedida.LT, label: "Litro (LT)" },
  { value: UnidadMedida.KG, label: "Kilogramo (KG)" },
  { value: UnidadMedida.G, label: "Gramo (G)" },
  { value: UnidadMedida.MG, label: "Miligramo (MG)" },
];

/**
 * Value Object Presentación. No tiene identidad propia: se compara por valor.
 * La regla "cantidad > 0 y unidad reconocida" se aplica al construirlo.
 */
export interface Presentacion {
  cantidad: number;
  unidad: UnidadMedida;
}

export const esUnidadMedidaValida = (valor: unknown): valor is UnidadMedida =>
  typeof valor === "string" && Object.values(UnidadMedida).includes(valor as UnidadMedida);

/**
 * Único punto de construcción de una Presentación válida.
 * Devuelve null si la cantidad no es > 0 o la unidad no es reconocida.
 */
export const crearPresentacion = (cantidad: number | null | undefined, unidad: string | null | undefined): Presentacion | null => {
  if (cantidad == null || Number.isNaN(cantidad) || cantidad <= 0) return null;
  if (!esUnidadMedidaValida(unidad)) return null;
  return { cantidad, unidad };
};

/** Equivalente en el front de Presentacion.getDescripcionFormateada() del backend. */
export const formatearPresentacion = (presentacion: Presentacion | null | undefined): string =>
  presentacion ? `${presentacion.cantidad} ${presentacion.unidad}` : "";

/** Campos planos con los que el backend expone la Presentación (no es un objeto anidado). */
export interface PresentacionPayload {
  presentacionCantidad?: number | null;
  presentacionUnidadMedida?: UnidadMedida | null;
}

export interface ConsultarPresentacion {
  id: number;
  denominacion: string;
}

export interface SelectPresentacion {
  id: number;
  denominacion: string;
}

export interface SelectEnvase {
  id: number;
  denominacion: string;
}

export interface SelectUnidad {
  id: number;
  denominacion: string;
}