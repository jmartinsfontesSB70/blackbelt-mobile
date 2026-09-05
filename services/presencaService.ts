import { apiFetch } from "./api";

export async function listarPresencas(page: number, size: number) {
  return await apiFetch(`/presencas?page=${page}&size=${size}`);
}

export async function criarPresenca(presenca: any) {
  return await apiFetch("/presencas", {
    method: "POST",
    body: JSON.stringify(presenca),
  });
}

export async function registrarChamada(chamada: {
  turmaId: number;
  data: string;
  matriculaIdsPresentes: number[];
}) {
  return await apiFetch("/presencas/chamada", {
    method: "POST",
    body: JSON.stringify(chamada),
  });
}

export async function listarPresencasPorTurmaEData(
  turmaId: number,
  data: string,
) {
  return await apiFetch(`/presencas/chamada?turmaId=${turmaId}&data=${data}`);
}

export async function buscarPresenca(id: string) {
  return await apiFetch(`/presencas/${id}`);
}

export async function atualizarPresenca(id: string, presenca: any) {
  return await apiFetch(`/presencas/${id}`, {
    method: "PUT",
    body: JSON.stringify(presenca),
  });
}

export async function excluirPresenca(id: number) {
  return await apiFetch(`/presencas/${id}`, {
    method: "DELETE",
  });
}
