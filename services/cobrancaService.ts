import { apiFetch } from "./api";

export async function listarCobrancas(
  page: number,
  size: number,
  pesquisa: string = "",
  sort: string = "dataVencimento",
  direction: string = "desc",
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    pesquisa,
    sort,
    direction,
  });

  return await apiFetch(`/cobrancas?${params.toString()}`);
}

export async function buscarCobranca(id: string) {
  return await apiFetch(`/cobrancas/${id}`);
}

export async function criarCobranca(cobranca: any) {
  return await apiFetch("/cobrancas", {
    method: "POST",
    body: JSON.stringify(cobranca),
  });
}

export async function listarCobrancasPorMatricula(matriculaId: string) {
  return await apiFetch(`/cobrancas/matricula/${matriculaId}`);
}

export async function cancelarCobranca(id: string) {
  return await apiFetch(`/cobrancas/${id}/cancelar`, {
    method: "PATCH",
  });
}

export async function excluirCobranca(id: string) {
  return await apiFetch(`/cobrancas/${id}`, {
    method: "DELETE",
  });
}

export async function listarPagamentos(cobrancaId: string) {
  return await apiFetch(`/cobrancas/${cobrancaId}/pagamentos`);
}

export async function registrarPagamento(cobrancaId: string, pagamento: any) {
  return await apiFetch(`/cobrancas/${cobrancaId}/pagamentos`, {
    method: "POST",
    body: JSON.stringify(pagamento),
  });
}

export async function excluirPagamento(
  cobrancaId: string,
  pagamentoId: string,
) {
  return await apiFetch(`/cobrancas/${cobrancaId}/pagamentos/${pagamentoId}`, {
    method: "DELETE",
  });
}
