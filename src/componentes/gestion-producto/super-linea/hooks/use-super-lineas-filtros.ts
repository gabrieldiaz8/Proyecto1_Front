import { useEffect, useState } from "react";
import { useFiltrosContext } from "../../../../context/filtros-contesxt";

export function useSuperlineasFiltros() {
  const [filtrosInicializados, setFiltrosInicializados] = useState(false);
  const { setFiltrosNecesarios, valoresFiltros, limpiarFiltros, buscar, setBuscar } =
    useFiltrosContext();

  useEffect(() => {
    limpiarFiltros();
    setBuscar({ cont: 0, componente: "consultar-super-linea" });
    setFiltrosNecesarios({ denominacion: true });
    setFiltrosInicializados(true);
  }, []);

  return {
    filtrosInicializados,
    valoresFiltros,
    buscar,
  };
}
//setean informacion este filtro es para saber que está buscando, en este caso es consultar-super-linea. Solo cambia eso 