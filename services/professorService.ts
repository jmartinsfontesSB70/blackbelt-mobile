import { apiFetch } from "./api";

export async function listarProfessores(
  page: number,
  size: number,
  pesquisa: string = "",
  sort: string = "id",
  direction: string = "desc",
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    pesquisa,
    sort,
    direction,
  });

  return await apiFetch(`/professores?${params.toString()}`);
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

export async function buscarFotoProfessor(id: string) {
  return await apiFetch(`/professores/${id}/foto`, {
    responseType: "arrayBuffer",
  });
}

export async function enviarFotoProfessor(id: string, arquivo: any) {
  const formData = new FormData();

  formData.append("foto", arquivo);

  return await apiFetch(`/professores/${id}/foto`, {
    method: "POST",
    body: formData,
  });
}

export async function excluirFotoProfessor(id: string) {
  return await apiFetch(`/professores/${id}/foto`, {
    method: "DELETE",
  });
}
