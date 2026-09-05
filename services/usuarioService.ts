import { apiFetch } from "./api";

export async function listarUsuarios() {
  return await apiFetch("/usuarios");
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
