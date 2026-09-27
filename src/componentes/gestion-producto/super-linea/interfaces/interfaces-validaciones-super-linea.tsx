import * as yup from "yup";
import { Superlinea } from "../../../../interfaces/gestion-producto/super-linea/interfaces-superlinea";

export const schema = yup.object().shape({
  denominacion: yup
    .string()
    .trim()
    .lowercase()
    .required("La denominación es obligatoria.")
    .max(255, "La denominación no puede superar los 255 caracteres.")
    .matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ]+$/, "Solo se permiten letras, números y espacios."),
  observacion: yup.string().nullable().optional(),
});

export type FormValues = yup.InferType<typeof schema>;

export const transformData = (superLinea: Superlinea): FormValues => {
  return {
    denominacion: superLinea.denominacion,
    observacion: superLinea.observacion ?? null,
  };
};
