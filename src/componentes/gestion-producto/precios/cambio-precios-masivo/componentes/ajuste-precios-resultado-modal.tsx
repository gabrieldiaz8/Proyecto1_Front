import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "../../../../ui/Card";
import { Button } from "../../../../ui/Button";
import { AjustePreciosMasivoResponse } from "../../../../../interfaces/gestion-producto/precios/interfaces-precios";

// CR-006: Modal de resumen de resultados del ajuste masivo de precios

interface Props {
  resultado: AjustePreciosMasivoResponse | null;
  onClose: () => void;
}

export default function AjustePreciosResultadoModal({ resultado, onClose }: Props) {
  if (resultado === null) return null;

  const hayExcluidos = resultado.excluidos.length > 0;
  const todoOk =
    resultado.actualizadosExitosamente === resultado.totalProcesados && !hayExcluidos;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-2xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative">

        {/* Encabezado */}
        <div className="form-header">
          <button type="button" onClick={onClose} className="btn-onClose-title-form">
            &times;
          </button>
          <h2 className="form-title">
            {todoOk ? (
              <CheckCircle2 className="form-icon text-green-500" />
            ) : (
              <XCircle className="form-icon text-yellow-500" />
            )}
            <span>Resultado del ajuste masivo</span>
          </h2>
          <p className="form-subtitle">
            Se actualizaron con éxito{" "}
            <strong>{resultado.actualizadosExitosamente}</strong> de{" "}
            <strong>{resultado.totalProcesados}</strong> productos procesados.
          </p>
        </div>

        <CardContent className="px-6 py-4 space-y-4">
          {/* Tabla de excluidos — solo si hay alguno */}
          {hayExcluidos && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Productos excluidos ({resultado.excluidos.length}):
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2 font-semibold">ID</th>
                      <th className="px-4 py-2 font-semibold">Producto</th>
                      <th className="px-4 py-2 font-semibold">Motivo de exclusión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resultado.excluidos.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-gray-500 tabular-nums">{item.id}</td>
                        <td className="px-4 py-2 font-medium text-gray-800">{item.denominacion}</td>
                        <td className="px-4 py-2 text-gray-600">{item.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensaje cuando todo fue exitoso */}
          {!hayExcluidos && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              Todos los productos fueron actualizados correctamente. No hubo exclusiones.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-end px-6 py-4">
          <Button type="button" onClick={onClose} className="btn btn-dark">
            Cerrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
