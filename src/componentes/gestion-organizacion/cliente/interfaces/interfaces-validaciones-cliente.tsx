import * as yup from "yup";
import { Cliente } from "../../../../interfaces/gestion-organizacion/cliente/interfaces-cliente";

//===================== interfaces para las cosas que se van a ingresar en el formulario y es necesario validarlas ==========//

export interface FormValues {
  codigo?: string | null;
  denominacion: string;
  denominacionAfip?: string | null;
  cuit?: string;
  dni?: string;
  mail?: string | null;
  contactoNombre?: string | null;
  contactoCargo?: string | null;
  celular?: string | null;
  observacion?: string | null;
  condicionIvaId: number;
  vendedorId: number;
}

//===================== schema de validacion ============================================//

export const schema = (requiereCuit: boolean, requiereDocumento: boolean) =>
  yup.object<FormValues>().shape({
    denominacion: yup
      .string()
      .trim()
      .lowercase()
      .required("La denominación es obligatoria.")
      .test("not-only-spaces", "La denominación no puede contener solo espacios.", (value) => {
        return value ? value.trim().length > 0 : false;
      })
      .max(255, "Máximo 255 caracteres.")

      .matches(/^[A-Za-z0-9 %\-_"'áéíóúÁÉÍÓÚñÑ./]+$/, "Solo se permiten letras, números y espacios."),

    denominacionAfip: yup.string().optional().nullable().max(255, "Máximo 255 caracteres."),
    cuit: yup.string().when([], {
      is: () => requiereCuit,
      then: (schema) => schema.required("El CUIT es obligatorio.")
        .matches(/^\d+$/, "El CUIT debe contener solo números.")
        .test("cuit-length", "El CUIT debe tener exactamente 11 dígitos.", (value) => {
          return value ? value.length === 11 : true;
        }),
      otherwise: (schema) => schema.optional()
        .test("cuit-format-optional", "El CUIT debe contener solo números y tener exactamente 11 dígitos.", (value) => {
          if (!value) return true; // Si está vacío, es válido (es opcional)
          return /^\d{11}$/.test(value);
        }),
    }),
    dni: yup.string().when([], {
      is: () => requiereDocumento,
      then: (schema) => schema.required("El DNI es obligatorio.")
        .matches(/^\d+$/, "El DNI debe contener solo números.")
        .test("dni-length", "El DNI debe tener entre 7 y 8 dígitos.", (value) => {
          return value ? (value.length === 7 || value.length === 8) : true;
        }),
      otherwise: (schema) => schema.optional()
        .test("dni-format-optional", "El DNI debe contener solo números y tener entre 7 y 8 dígitos.", (value) => {
          if (!value) return true; // Si está vacío, es válido (es opcional)
          return /^\d{7,8}$/.test(value);
        }),
    }),
    observacion: yup.string().optional().nullable(),
    codigo: yup.string().optional().nullable(),
    mail: yup
      .string()
      .transform((value) => (value === "" ? null : value))
      .email("El mail no es válido.")
      .optional()
      .nullable(),
    contactoNombre: yup
      .string()
      .transform((value) => (value === "" ? null : value))
      .optional()
      .nullable()
      .max(255, "Máximo 255 caracteres.")
      .matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ]*$/, "Solo se permiten letras, números y espacios."),
    contactoCargo: yup
      .string()
      .transform((value) => (value === "" ? null : value))
      .optional()
      .nullable()
      .max(255, "Máximo 255 caracteres.")
      .matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ]*$/, "Solo se permiten letras, números y espacios."),
    celular: yup
      .string()
      .transform((value) => (value === "" ? null : value))
      .optional()
      .nullable()
      .max(50, "Máximo 50 caracteres.")
      .matches(/^[0-9\s\-+()]*$/, "Solo se permiten números, espacios y caracteres: - + ( )"),
    condicionIvaId: yup.number().required("La condicion de iva es obligatoria."),
    vendedorId: yup.number().required("El vendedor es obligatorio."),
  });

//===================== transform data ============================================//

export const transformData = (cliente: Cliente): FormValues => {
  return {
    codigo: cliente.codigo,
    denominacion: cliente.denominacion,
    denominacionAfip: cliente.denominacionAfip ?? null,
    cuit: cliente.cuit ?? "",
    dni: cliente.dni ?? "",
    mail: cliente.mail ?? "",
    contactoNombre: cliente.contactoNombre ?? "",
    contactoCargo: cliente.contactoCargo ?? "",
    celular: cliente.celular ?? "",
    condicionIvaId: cliente.condicionIva.id,
    vendedorId: cliente.vendedor.id,
    observacion: cliente.observacion ?? null,
  };
};
