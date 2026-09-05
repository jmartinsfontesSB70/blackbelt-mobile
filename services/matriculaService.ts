import { apiFetch } from "./api";

export async function listarMatriculas(page: number, size: number) {
  return await apiFetch(`/matriculas?page=${page}&size=${size}`);
}

export async function criarMatricula(matricula: any) {
  return await apiFetch("/matriculas", {
    method: "POST",
    body: JSON.stringify(matricula),
  });
}

export async function buscarMatricula(id: string) {
  return await apiFetch(`/matriculas/${id}`);
}

export async function atualizarMatricula(id: string, matricula: any) {
  return await apiFetch(`/matriculas/${id}`, {
    method: "PUT",
    body: JSON.stringify(matricula),
  });
}

export async function excluirMatricula(id: number) {
  return await apiFetch(`/matriculas/${id}`, {
    method: "DELETE",
  });
}

export async function listarMatriculasParaSelecao() {
  const primeiraPagina = await listarMatriculas(0, 10);

  const matriculas = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarMatriculas(pagina, 10);

    matriculas.push(...dadosPagina.content);
  }

  return matriculas;
}

export async function listarMatriculasAtivasPorTurma(
  turmaId: number,
  data: string,
) {
  return await apiFetch(`/matriculas/turma/${turmaId}/ativas?data=${data}`);
}
