import { apiFetch } from "./api";

export async function listarAlunos(page: number, size: number) {
  return await apiFetch(`/alunos?page=${page}&size=${size}`);
}
