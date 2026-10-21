import { apiFetch } from "./api";

export interface LicencaResponse {
  mensagem: string;
  dataInicio: string;
  dataExpiracao: string;
}

export async function ativarLicenca(token: string): Promise<LicencaResponse> {
  return await apiFetch("/licenca/ativar", {
    method: "POST",
    body: JSON.stringify({
      token: token.trim(),
    }),
  });
}

//console.log("licencaService carregado:", typeof ativarLicenca);
