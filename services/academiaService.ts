import { apiFetch } from "./api";

export interface EnderecoAcademiaRequest {
  rua: string;
  numero: string;
  bairro: string;
  cidadeId: number;
  cep: string;
  pontoReferencia: string;
}

export interface EnderecoAcademiaResponse {
  id: number;
  rua: string;
  numero: string;
  bairro: string;
  cidadeId: number;
  cidade: string;
  uf: string;
  cep: string;
  pontoReferencia: string;
}

export interface AcademiaRequest {
  nome: string;
  responsavel: string;
  cnpj: string;
  endereco: EnderecoAcademiaRequest;
}

export interface AcademiaResponse {
  id: number;
  nome: string;
  responsavel: string;
  cnpj: string | null;
  endereco: EnderecoAcademiaResponse | null;
  dataCadastro: string;
  dataExpiracao: string;
  possuiLogo: boolean;
}

export interface StatusInstalacaoResponse {
  academiaCadastrada: boolean;
}

export async function verificarStatusInstalacao(): Promise<StatusInstalacaoResponse> {
  return await apiFetch("/academia/status-instalacao");
}

export async function cadastrarAcademia(
  academia: AcademiaRequest,
  logo?: { uri: string; name: string; type: string },
): Promise<AcademiaResponse> {
  const formData = new FormData();

  formData.append("academia", {
    string: JSON.stringify(academia),
    type: "application/json",
    name: "academia.json",
  } as any);

  if (logo) {
    formData.append("logo", {
      uri: logo.uri,
      name: logo.name,
      type: logo.type,
    } as any);
  }

  return await apiFetch("/academia/instalacao", {
    method: "POST",
    body: formData,
  });
}

export async function buscarAcademia(): Promise<AcademiaResponse> {
  return await apiFetch("/academia");
}

export async function atualizarAcademia(
  academia: AcademiaRequest,
): Promise<AcademiaResponse> {
  return await apiFetch("/academia", {
    method: "PUT",
    body: JSON.stringify(academia),
  });
}

export async function atualizarLogoAcademia(logo: {
  uri: string;
  name: string;
  type: string;
}): Promise<AcademiaResponse> {
  const formData = new FormData();

  formData.append("logo", {
    uri: logo.uri,
    name: logo.name,
    type: logo.type,
  } as any);

  return await apiFetch("/academia/logo", {
    method: "PUT",
    body: formData,
  });
}

export async function buscarLogoAcademia(): Promise<ArrayBuffer> {
  return await apiFetch("/academia/logo", {
    responseType: "arrayBuffer",
  });
}
