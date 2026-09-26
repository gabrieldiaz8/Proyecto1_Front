import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import SuperlineaService from "../services/super-linea-service";
import { Superlinea } from "../../../../interfaces/gestion-producto/super-linea/interfaces-superlinea";
import { Auditoria, ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import { TipoAlerta, TituloAlerta, useAlerts } from "../../../herramientas/alertas/alertas";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";
import { getUsuarioId } from "../../../../utils/auth";

export function useSuperlineas() {
  const [superlineas, setSuperlineas] = useState<Superlinea[]>([]);
  const [loading, setLoading] = useState(false);

  const [superlineaSeleccionada, setSuperlineaSeleccionada] = useState<Superlinea | null>(null);
  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);

  const { alerts, addAlert, removeAlert } = useAlerts();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const usuarioId = getUsuarioId();

  const eliminarSuperlinea = async (id: number) => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message: "¿Estás seguro de que quieres eliminar este elemento?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (!confirmed) return;

    try {
      const response: ResponsePost = await SuperlineaService.eliminar(id, usuarioId);
      setSuperlineas((prev) => prev.filter((m) => m.id !== id));

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: response.mensaje,
        autoClose: true,
      });
    } catch {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message: "No se puede eliminar la superlinea porque está en uso.",
        autoClose: true,
      });
    }
  };

  const cargarAuditoria = async (id: number) => {
    const data = await SuperlineaService.obtenerAuditoria(id);
    setAuditoria(data);
  };

  return {
    superlineas,
    setSuperlineas,
    loading,
    setLoading,

    superlineaSeleccionada,
    setSuperlineaSeleccionada,
    auditoria,
    setAuditoria,

    eliminarSuperlinea,
    cargarAuditoria,

    alerts,
    removeAlert,
    AlertasConfirmacion,
  };
}
//muestra los mensajes de exito o eliminacion y despues se setea ese estado para llamar al metodo del service para que elimine. Comunica mi pantalla con el service correspondiente. 