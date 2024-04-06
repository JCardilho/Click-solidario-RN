import { AxiosRoutes, api } from '../api';

interface State {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

interface Municipality {
  nome: string;
  codigo_ibge: string;
}

interface Cep {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

const GetAllStatesFromBrazil = async (): Promise<State[]> => {
  const result = await api.get(AxiosRoutes.UF);
  return result.data;
};

const GetAllMunicipalityFromBrazil = async (uf: string): Promise<Municipality[]> => {
  const result = await api.get(`${AxiosRoutes.MUNICIPIOS}${uf}`);
  return result.data;
};

const GetForCep = async (cep: string): Promise<Cep> => {
  const result = await api.get(`${AxiosRoutes.CEP}${cep}`);
  return result.data;
};

export const LocationService = {
  GetAllStatesFromBrazil,
  GetAllMunicipalityFromBrazil,
  GetForCep,
};
