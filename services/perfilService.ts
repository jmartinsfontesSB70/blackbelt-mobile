import { apiFetch } from "./api";

export async function listarPerfis() {
  return await apiFetch("/perfis");
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
