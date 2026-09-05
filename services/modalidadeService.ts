import { apiFetch } from "./api";

export async function listarModalidades(page: number, size: number) {
  return await apiFetch(`/modalidades?page=${page}&size=${size}`);
}

export async function criarModalidade(modalidade: any) {
  return await apiFetch("/modalidades", {
    method: "POST",
    body: JSON.stringify(modalidade),
  });
}

export async function buscarModalidade(id: string) {
  return await apiFetch(`/modalidades/${id}`);
}

export async function atualizarModalidade(id: string, modalidade: any) {
  return await apiFetch(`/modalidades/${id}`, {
    method: "PUT",
    body: JSON.stringify(modalidade),
  });
}

export async function excluirModalidade(id: number) {
  return await apiFetch(`/modalidades/${id}`, {
    method: "DELETE",
  });
}

export async function listarModalidadesParaSelecao() {
  const primeiraPagina = await listarModalidades(0, 10);

  const modalidades = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarModalidades(pagina, 10);

    modalidades.push(...dadosPagina.content);
  }

  return modalidades;
}
