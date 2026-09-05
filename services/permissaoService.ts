import { apiFetch } from "./api";

export async function listarPermissoes() {
  return await apiFetch("/permissoes");
}

export async function buscarPermissao(id: string) {
  return await apiFetch(`/permissoes/${id}`);
}
