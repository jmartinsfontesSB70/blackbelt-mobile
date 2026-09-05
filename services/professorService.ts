import { apiFetch } from "./api";

export async function listarProfessores(page: number, size: number) {
  return await apiFetch(`/professores?page=${page}&size=${size}`);
}

export async function criarProfessor(professor: any) {
  return await apiFetch("/professores", {
    method: "POST",
    body: JSON.stringify(professor),
  });
}

export async function buscarProfessor(id: string) {
  return await apiFetch(`/professores/${id}`);
}

export async function atualizarProfessor(id: string, professor: any) {
  return await apiFetch(`/professores/${id}`, {
    method: "PUT",
    body: JSON.stringify(professor),
  });
}

export async function excluirProfessor(id: number) {
  return await apiFetch(`/professores/${id}`, {
    method: "DELETE",
  });
}

export async function listarProfessoresParaSelecao() {
  const primeiraPagina = await listarProfessores(0, 10);

  const professores = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarProfessores(pagina, 10);

    professores.push(...dadosPagina.content);
  }

  return professores;
}
