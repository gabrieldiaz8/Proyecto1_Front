import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { useCatalogosContext } from "../../../../../context/catalogos-context";
import { schemaPreciosMasivo } from "../../producto/interfaces/interfaces-validaciones-precios-masivo";
import { AjustePreciosMasivoPayload } from "../../../../../interfaces/gestion-producto/precios/interfaces-precios";

// FormValues es local al componente, espejo de AjustePreciosMasivoPayload
interface FormValues {
  tipoAjuste: "AUMENTO" | "DISMINUCION";
  modalidad: "PORCENTAJE" | "MONTO";
  valor: number;
  alcance: "GLOBAL" | "LINEA";
  lineaId?: number;
}

// Estilos reutilizables para react-select, igual al patrón de filtros-cambio-precios.tsx
const selectStyles = {
  control: (base: object) => ({ ...base, color: "black" }),
  singleValue: (base: object) => ({ ...base, color: "black" }),
  option: (base: object, { isSelected, isFocused }: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    color: isSelected ? "white" : "black",
    backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#93c5fd" : "white",
  }),
  menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
};

interface Props {
  onClose: () => void;
  onSubmitValues: (payload: AjustePreciosMasivoPayload) => void;
}

export default function AjustePreciosMasivoForm({ onClose, onSubmitValues }: Props) {
  const { lineas } = useCatalogosContext();

  const {
    register,
    handleSubmit,
    watch,
    control,
    resetField,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schemaPreciosMasivo),
    mode: "onChange",
    defaultValues: {
      tipoAjuste: "AUMENTO",
      modalidad: "PORCENTAJE",
      valor: undefined,
      alcance: "GLOBAL",
      lineaId: undefined,
    },
  });

  const alcance = watch("alcance");

  // Resetea lineaId cuando el alcance cambia a un valor distinto de "LINEA"
  useEffect(() => {
    if (alcance !== "LINEA") {
      resetField("lineaId");
    }
  }, [alcance, resetField]);

  const onSubmit = (formData: FormValues) => {
    const payload: AjustePreciosMasivoPayload = {
      tipoAjuste: formData.tipoAjuste,
      modalidad: formData.modalidad,
      valor: formData.valor,
      alcance: formData.alcance,
      ...(formData.alcance === "LINEA" && { lineaId: formData.lineaId }),
    };
    onSubmitValues(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-lg bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative">
        {/* Encabezado */}
        <div className="form-header">
          <button type="button" onClick={onClose} className="btn-onClose-title-form">
            &times;
          </button>
          <h2 className="form-title">
            <TrendingUp className="form-icon" />
            <span>Ajuste Masivo de Precios</span>
          </h2>
          <p className="form-subtitle">
            Configurá los parámetros del ajuste. Se aplicará a todos los productos del alcance seleccionado.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 px-6 py-4">

            {/* Tipo de ajuste */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo de ajuste</label>
              <select
                {...register("tipoAjuste")}
                className="bg-white text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="AUMENTO">Aumento</option>
                <option value="DISMINUCION">Disminución</option>
              </select>
              {errors.tipoAjuste && (
                <span className="text-xs text-red-500">{errors.tipoAjuste.message}</span>
              )}
            </div>

            {/* Modalidad */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Modalidad</label>
              <select
                {...register("modalidad")}
                className="bg-white text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="PORCENTAJE">Porcentaje</option>
                <option value="MONTO">Monto fijo</option>
              </select>
              {errors.modalidad && (
                <span className="text-xs text-red-500">{errors.modalidad.message}</span>
              )}
            </div>

            {/* Valor */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Valor</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 10.5"
                {...register("valor", { valueAsNumber: true })}
                className="bg-white text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.valor && (
                <span className="text-xs text-red-500">{errors.valor.message}</span>
              )}
            </div>

            {/* Alcance */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Alcance</label>
              <select
                {...register("alcance")}
                className="bg-white text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="GLOBAL">Global</option>
                <option value="LINEA">Línea</option>
              </select>
              {errors.alcance && (
                <span className="text-xs text-red-500">{errors.alcance.message}</span>
              )}
            </div>

            {/* Selector de línea — solo visible cuando alcance === "LINEA" */}
            {alcance === "LINEA" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Línea</label>
                <Controller
                  name="lineaId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={(lineas ?? []).find((option) => option.id === field.value) ?? null}
                      options={lineas ?? []}
                      getOptionLabel={(option) => option.denominacion}
                      getOptionValue={(option) => String(option.id)}
                      onChange={(option) => field.onChange(option ? option.id : undefined)}
                      placeholder="Seleccione una línea"
                      className="text-black"
                      menuPortalTarget={document.body}
                      styles={selectStyles}
                    />
                  )}
                />
                {errors.lineaId && (
                  <span className="text-xs text-red-500">{errors.lineaId.message}</span>
                )}
              </div>
            )}

          </CardContent>

          {/* Footer */}
          <CardFooter className="flex justify-end gap-3 px-6 py-4">
            <Button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="btn btn-dark"
            >
              Continuar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
