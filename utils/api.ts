import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://brasilapi.com.br/api',
  timeout: 6000,
});

export enum AxiosRoutes {
  UF = '/ibge/uf/v1/',
  MUNICIPIOS = '/ibge/municipios/v1/',
  CEP = '/cep/v1/',
}
