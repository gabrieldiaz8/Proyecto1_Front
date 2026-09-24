import { useConfirmation, TipoAlertaConfirmacion } from "../../../../herramientas/alertas/alertas-confirmacion";
import { useCatalogosContext } from "../../../../../context/catalogos-context";
import { AjustePreciosMasivoPayload } from "../../../../../interfaces/gestion-producto/precios/interfaces-precios";

// ============================================================================================
// CR-006: Hook de confirmación previa al ajuste masivo de precios
//
// Responsabilidad: armar el mensaje legible a partir del payload validado y mostrar
// el diálogo de confirmación estándar del proyecto antes de invocar onConfirmado.
// No llama al service — quien reciba onConfirmado decide qué hacer (commit 6+).
// ============================================================================================

interface UseConfirmarAjusteMasivoReturn {
  /** Muestra el diálogo de confirmación. Si el usuario acepta, invoca onConfirmado(payload). */
  confirmarAjuste: (
    payload: AjustePreciosMasivoPayload,
    onConfirmado: (payload: AjustePreciosMasivoPayload) => void
  ) => Promise<void>;
  /** Componente del diálogo — debe renderizarse en el JSX del padre, igual que en el resto del proyecto. */
  AlertasConfirmacion: () => JSX.Element;
}

export function useConfirmarAjusteMasivo(): UseConfirmarAjusteMasivoReturn {
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();
  const { lineas } = useCatalogosContext();

  const armarMensaje = (payload: AjustePreciosMasivoPayload): string => {
    const verbo = payload.tipoAjuste === "AUMENTO" ? "aumentar" : "disminuir";
    const modalidad =
      payload.modalidad === "PORCENTAJE"
        ? `un ${payload.valor}%`
        : `$${payload.valor}`;

    let alcanceTexto: string;
    if (payload.alcance === "GLOBAL") {
      alcanceTexto = "todos los productos";
    } else {
      // Resuelve el nombre de la línea a partir del id; si no se encuentra, usa el id como fallback
      const linea = (lineas ?? []).find((l) => l.id === payload.lineaId);
      const nombreLinea = linea?.denominacion ?? `línea #${payload.lineaId}`;
      alcanceTexto = `todos los productos de la línea "${nombreLinea}"`;
    }

    return `¿Confirmás ${verbo} ${modalidad} el precio de ${alcanceTexto}?\n\nEsta acción no se puede deshacer.`;
  };

  const confirmarAjuste = async (
    payload: AjustePreciosMasivoPayload,
    onConfirmado: (payload: AjustePreciosMasivoPayload) => void
  ): Promise<void> => {
    const mensaje = armarMensaje(payload);

    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.WARNING,
      title: "Confirmar ajuste masivo de precios",
      message: mensaje,
      confirmText: "Confirmar ajuste",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (confirmed) {
      onConfirmado(payload);
    }
  };

  return { confirmarAjuste, AlertasConfirmacion };
}
