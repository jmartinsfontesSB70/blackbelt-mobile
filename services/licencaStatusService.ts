import { apiFetch } from "./api";

export interface LicencaStatusResponse {
  situacao: "AVALIACAO" | "LICENCIADA" | "EXPIRADA";
  dataExpiracao: string | null;
  diasRestantes: number;
}

export async function consultarStatusLicenca(): Promise<LicencaStatusResponse> {
  return await apiFetch("/licenca/status");
}
