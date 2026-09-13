import { apiFetch } from "./api";

export async function listarModalidades(
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

  return await apiFetch(`/modalidades?${params.toString()}`);
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
