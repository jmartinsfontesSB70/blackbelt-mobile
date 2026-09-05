import { apiFetch } from "./api";

export async function listarAlunos(page: number, size: number) {
  return await apiFetch(`/alunos?page=${page}&size=${size}`);
}

export async function criarAluno(aluno: any) {
  return await apiFetch("/alunos", {
    method: "POST",
    body: JSON.stringify(aluno),
  });
}

export async function buscarAluno(id: string) {
  return await apiFetch(`/alunos/${id}`);
}

export async function atualizarAluno(id: string, aluno: any) {
  return await apiFetch(`/alunos/${id}`, {
    method: "PUT",
    body: JSON.stringify(aluno),
  });
}

export async function excluirAluno(id: number) {
  return await apiFetch(`/alunos/${id}`, {
    method: "DELETE",
  });
}

export async function listarAlunosParaSelecao() {
  const primeiraPagina = await listarAlunos(0, 10);

  const alunos = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarAlunos(pagina, 10);

    alunos.push(...dadosPagina.content);
  }

  return alunos;
}
