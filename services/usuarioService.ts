import { apiFetch } from "./api";

export async function listarUsuarios(
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

  return await apiFetch(`/usuarios?${params.toString()}`);
}

export async function criarUsuario(usuario: any) {
  return await apiFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify(usuario),
  });
}

export async function buscarUsuario(id: string) {
  return await apiFetch(`/usuarios/${id}`);
}

export async function atualizarUsuario(id: string, usuario: any) {
  return await apiFetch(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(usuario),
  });
}

export async function excluirUsuario(id: number) {
  return await apiFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });
}

export async function alterarMinhaSenha(senhaAtual: string, novaSenha: string) {
  return await apiFetch("/usuarios/minha-senha", {
    method: "PATCH",
    body: JSON.stringify({
      senhaAtual,
      novaSenha,
    }),
  });
}
