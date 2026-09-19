import { apiFetch } from "./api";

const API_URL = "/historico-graduacoes";

export async function listarHistoricoGraduacaoPorAluno(alunoId) {
  return await apiFetch(`${API_URL}/aluno/${alunoId}`);
}

export async function cadastrarHistoricoGraduacao(historico) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(historico),
  });
}
