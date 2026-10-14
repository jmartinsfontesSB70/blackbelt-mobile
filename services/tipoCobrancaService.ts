import { apiFetch } from "./api";

export async function listarTiposCobranca() {
  return await apiFetch("/tipos-cobranca");
}

export async function buscarTipoCobranca(id: string) {
  return await apiFetch(`/tipos-cobranca/${id}`);
}

export async function criarTipoCobranca(tipoCobranca: any) {
  return await apiFetch("/tipos-cobranca", {
    method: "POST",
    body: JSON.stringify(tipoCobranca),
  });
}

export async function atualizarTipoCobranca(id: string, tipoCobranca: any) {
  return await apiFetch(`/tipos-cobranca/${id}`, {
    method: "PUT",
    body: JSON.stringify(tipoCobranca),
  });
}

export async function excluirTipoCobranca(id: string) {
  return await apiFetch(`/tipos-cobranca/${id}`, {
    method: "DELETE",
  });
}
