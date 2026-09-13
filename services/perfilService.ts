import { apiFetch } from "./api";

export async function listarPerfis(
  page: number,
  size: number,
  sort: string = "nome",
  direction: string = "asc",
) {
  return await apiFetch(
    `/perfis?page=${page}&size=${size}&sort=${sort}&direction=${direction}`,
  );
}

export async function listarPerfisParaSelecao() {
  const primeiraPagina = await listarPerfis(0, 10);

  const perfis = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarPerfis(pagina, 10);

    perfis.push(...dadosPagina.content);
  }

  return perfis;
}

export async function criarPerfil(perfil: any) {
  return await apiFetch("/perfis", {
    method: "POST",
    body: JSON.stringify(perfil),
  });
}

export async function buscarPerfil(id: string) {
  return await apiFetch(`/perfis/${id}`);
}

export async function atualizarPerfil(id: string, perfil: any) {
  return await apiFetch(`/perfis/${id}`, {
    method: "PUT",
    body: JSON.stringify(perfil),
  });
}

export async function excluirPerfil(id: number) {
  return await apiFetch(`/perfis/${id}`, {
    method: "DELETE",
  });
}
