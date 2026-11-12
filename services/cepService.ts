import { apiFetch } from "./api";

export interface EnderecoCep {
  logradouro: string;
  bairro: string;
  cidadeId: number;
  cidade: string;
  uf: string;
}

export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoCep> {
  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    throw new Error("Informe um CEP válido.");
  }

  return await apiFetch(`/ceps/${cepLimpo}`);
}
