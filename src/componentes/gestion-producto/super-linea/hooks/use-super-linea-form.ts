import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { jwtDecode } from "jwt-decode";
import SuperlineaService from "../services/super-linea-service";
import {
  FormValues,
  schema,
  transformData,
} from "../interfaces/interfaces-validaciones-super-linea";
import { Superlinea } from "../../../../interfaces/gestion-producto/super-linea/interfaces-superlinea";
import { parseApiError } from "../../../../utils/errores";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import { getUsuarioId } from "../../../../utils/auth";

export function useSuperlineaForm(
  superlinea: Superlinea | undefined,
  onClose: () => void,
  onSuccess: (mensajeAlerta: string) => void
) {
  // ===================== TOKEN =====================
  const usuarioId = getUsuarioId();


  // ===================== FORM =====================
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: superlinea ? transformData(superlinea) : {},
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = methods;

  // ===================== SUBMIT =====================
  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;

    try {
      if (superlinea) {
        const payload = {
          denominacion: formData.denominacion,
          observacion: formData.observacion,
          usuarioUpdatedId: usuarioId,
        };

        console.log("Payload enviado:", JSON.stringify(payload, null, 2));

        response = await SuperlineaService.actualizar(superlinea.id, payload);
      } else {
        const payload = {
          ...formData,
          usuarioCreatedId: usuarioId,
        };

        console.log("Payload enviado:", JSON.stringify(payload, null, 2));

        response = await SuperlineaService.nuevo(payload);
      }

      onClose();
      onSuccess(response.mensaje);
    } catch (error) {
      const errorMessage = parseApiError(error);

      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return {
    methods,
    handleSubmit,
    onSubmit,
    isSubmitting,
    errors,
  };
}