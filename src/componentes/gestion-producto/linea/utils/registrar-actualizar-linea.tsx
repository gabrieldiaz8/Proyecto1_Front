import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import { Card } from "../../../ui/Card";
import { FormValues, schema, transformData, SublineasEnPayload, transformarSublineas } from "../interfaces/interfaces-validaciones-linea";
import LineaService from "../services/linea-service";
import SuperLineaService from "../../super-linea/services/super-linea-service";
import { Linea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";
import { Superlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import Select from "react-select";

import { Layers, PlusCircle } from "lucide-react";
import { parseApiError } from "../../../../utils/errores";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import CantidadesInput from "../../../herramientas/formateo-de-campos/cantidades-input";
import { getUsuarioId } from "../../../../utils/auth";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";

export default function RegistrarActualizarLineaForm({
  linea,
  onClose,
  onSuccess,
}: {
  linea?: Linea;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  const usuarioId = getUsuarioId();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();
  const [rStockCritico, setStockCritico] = useState(false);
  const [superLineas, setSuperLineas] = useState<Superlinea[]>([]);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico)) as any,
    defaultValues: linea ? transformData(linea) : {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    setError,
  } = methods;

 
  const stockMinimo = watch("stockMinimo");
  const utilizaStockMinimo = watch("utilizaStockMinimo");

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
  }, [utilizaStockMinimo, setValue]);

  useEffect(() => {
    setStockCritico(utilizaStockMinimo || false);
  }, [utilizaStockMinimo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (linea) {
          setValue("denominacion", linea.denominacion || "");
          setValue("observacion", linea.observacion || null);
          setValue("stockMinimo", linea.stockMinimo || 0);
          setValue("utilizaStockMinimo", linea.utilizaStockMinimo || false);
          setValue("superLineaId", linea.superLineaId || 0);
        }

        // LIMITACIÓN CONOCIDA: Al pedir con take: 100, si existen más de 100 SuperLíneas activas,
        // y la superLineaId actual de la línea queda fuera de esa página, el combo no podrá
        // renderizar su texto ni la considerará válida. Por ahora queda anotado como TODO.
        // Cargar SuperLineas y excluir sistema === 1 (salvo que sea la superlínea actual de la línea en edición)
        const superLineasResponse = await SuperLineaService.obtener({ skip: 0, take: 100 });
        if (superLineasResponse && superLineasResponse.data) {
          const opciones = superLineasResponse.data.filter(
            (sl: Superlinea) => sl.sistema !== 1 || (linea && sl.id === linea.superLineaId)
          );
          setSuperLineas(opciones);
          
          if (opciones.length > 0) {
            // Solo preseleccionamos la primera opción si es un alta (línea nueva)
            if (!linea) {
              setValue("superLineaId", opciones[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, [linea, setValue]);

  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;
    try {
     

      if (linea) {
        const payload = { ...formData, usuarioUpdatedId: usuarioId };
        response = await LineaService.actualizar(linea.id, payload);
      } else {
        const payload = { ...formData, usuarioCreatedId: usuarioId };
        response = await LineaService.nuevo(payload);
      }
      onClose();
      onSuccess(response.mensaje);
    } catch (error) {
      setError("root", { type: "manual", message: parseApiError(error) });
    }
  };

 

  

  
  const handleOnClose = async () => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DEFAULT,
      title: TituloAlertaConfirmacion.DEFAULT,
      message: "¿Estás seguro de que quieres cerrar el formulario? NO se guardaran los cambios.",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });
    if (confirmed) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="relative w-full max-w-7xl bg-white mx-auto shadow-lg rounded-lg overflow-hidden mt-10 mb-12">
        <EncabezadoFormularios
          title={linea ? "Actualizar Línea" : "Registrar Línea"}
          subtitle={linea ? "Modifica los detalles de la línea." : "Ingresa los datos de la nueva línea."}
          icon={<Layers className="form-icon" />}
          onClose={handleOnClose}
        />

        <fieldset disabled={linea?.sistema === 1}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 py-4">
                <div className="lg:col-span-2">
                  <FormInput name="denominacion" label="Denominación" placeholder="Ingresa la denominación" />
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 pb-1">
                    SuperLínea
                  </label>
                  <Select
                    value={superLineas.find((option) => option.id === watch("superLineaId")) || null}
                    options={superLineas}
                    getOptionLabel={(option) => option.denominacion}
                    getOptionValue={(option) => String(option.id)}
                    onChange={(selectedOption) => {
                      setValue("superLineaId", selectedOption?.id || 0);
                    }}
                    placeholder="Seleccione"
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({ ...base, color: "black" }),
                      singleValue: (base) => ({ ...base, color: "black" }),
                      option: (base, { isSelected, isFocused }) => ({
                        ...base,
                        color: isSelected ? "white" : "black",
                        backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#93c5fd" : "white",
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                  {errors.superLineaId && (
                    <p className="text-sm text-red-600 mt-1">{errors.superLineaId.message as string}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <FormInput name="observacion" label="Observación" placeholder="Ingresa una observación (opcional)" />
                </div>

                <div className="flex items-end gap-2 lg:col-span-1">
                  <label className="flex items-center pb-2">
                    <input
                      type="checkbox"
                      {...methods.register("utilizaStockMinimo")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  <CantidadesInput
                    name="stockMinimo"
                    label="Stock Crítico"
                    value={stockMinimo || 0}
                    onChange={(value) => setValue("stockMinimo", Number(value))}
                    disabled={utilizaStockMinimo ? false : true}
                  />
                </div>
              </CardContent>
              {errors.root?.message && (
                <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>
              )}

              <CardFooter className="flex justify-center">
                <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                  {isSubmitting ? (linea ? "Actualizando..." : "Registrando...") : linea ? "Actualizar" : "Registrar"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </fieldset>
      </Card>

     
      <AlertasConfirmacion />
    </div>
  );
}
