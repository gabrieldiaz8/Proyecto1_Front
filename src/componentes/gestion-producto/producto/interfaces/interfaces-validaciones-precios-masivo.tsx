import * as yup from "yup";

//===================== schema de validación — CR-006: Actualización masiva de precios ============================================//

export const schemaPreciosMasivo = yup.object().shape({
  tipoAjuste: yup
    .string()
    .oneOf(["AUMENTO", "DISMINUCION"], "El tipo de ajuste es inválido.")
    .required("El tipo de ajuste es obligatorio."),

  modalidad: yup
    .string()
    .oneOf(["PORCENTAJE", "MONTO"], "La modalidad es inválida.")
    .required("La modalidad es obligatoria."),

  valor: yup
    .number()
    .typeError("El valor debe ser un valor numérico.")
    .required("El valor es obligatorio.")
    .moreThan(0, "El valor debe ser mayor a 0."),

  alcance: yup
    .string()
    .oneOf(["GLOBAL", "LINEA"], "El alcance es inválido.")
    .required("El alcance es obligatorio."),

  lineaId: yup.number().when("alcance", {
    is: "LINEA",
    then: (schema) =>
      schema
        .typeError("La línea es obligatoria.")
        .required("La línea es obligatoria.")
        .moreThan(0, "Debe seleccionar una línea."),
    otherwise: (schema) => schema.optional().nullable(),
  }),
});
