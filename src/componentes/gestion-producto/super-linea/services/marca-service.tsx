import { FormValues } from "../interfaces/interfaces-validaciones-super-linea";
import { createCrudService } from "../../../../utils/crudFactory";
import axios from "axios";
import axiosConfig from "../../../../utils/axiosConfig";
import { obtenerUsuarioId } from "../../../../utils/usuarioHelper";

const baseService = createCrudService<FormValues>("superlinea");

const apiUrl = axiosConfig.apiUrl;

const SuperlineaService = {
  ...baseService,

  /* imprimirListado: async (): Promise<Blob> => {
    const url = `${apiUrl}/super-linea/imprimir-listado-todo`;
    const token = localStorage.getItem("Token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const params: any = {
      denominacion: "algo",
      usuarioId: 1
    };
    
    const response = await axios.get(url, {
    params, 
    headers
  });
    return response.data;
  }, */
};

export default SuperlineaService;
//