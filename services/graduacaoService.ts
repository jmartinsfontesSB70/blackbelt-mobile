import { apiFetch } from "./api";

export async function listarGraduacoesPorModalidade(modalidadeId: string) {
  return await apiFetch(`/graduacoes/modalidade/${modalidadeId}`);
}

export async function cadastrarGraduacao(graduacao: any) {
  return await apiFetch("/graduacoes", {
    method: "POST",
    body: JSON.stringify(graduacao),
  });
}

export async function buscarGraduacaoPorId(id: string) {
  return await apiFetch(`/graduacoes/${id}`);
}

export async function atualizarGraduacao(id: string, graduacao: any) {
  return await apiFetch(`/graduacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(graduacao),
  });
}

export async function excluirGraduacao(id: number) {
  return await apiFetch(`/graduacoes/${id}`, {
    method: "DELETE",
  });
}
