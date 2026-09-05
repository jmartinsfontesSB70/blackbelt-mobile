import { apiFetch } from "./api";

export async function listarTurmas(page: number, size: number) {
  return await apiFetch(`/turmas?page=${page}&size=${size}`);
}

export async function criarTurma(turma: any) {
  return await apiFetch("/turmas", {
    method: "POST",
    body: JSON.stringify(turma),
  });
}

export async function buscarTurma(id: string) {
  return await apiFetch(`/turmas/${id}`);
}

export async function atualizarTurma(id: string, turma: any) {
  return await apiFetch(`/turmas/${id}`, {
    method: "PUT",
    body: JSON.stringify(turma),
  });
}

export async function excluirTurma(id: number) {
  return await apiFetch(`/turmas/${id}`, {
    method: "DELETE",
  });
}

export async function listarTurmasParaSelecao() {
  const primeiraPagina = await listarTurmas(0, 10);

  const turmas = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarTurmas(pagina, 10);

    turmas.push(...dadosPagina.content);
  }

  return turmas;
}
