import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.4:8080/api/v1";
//const API_URL = "http://localhost:8080/api/v1";

export async function apiFetch(
  endpoint: string,
  options: RequestInit & {
    responseType?: "json" | "blob" | "arrayBuffer";
  } = {},
) {
  const token = await AsyncStorage.getItem("token");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && endpoint !== "/login") {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (endpoint === "/login" && response.status === 401) {
      throw new Error("Usuário ou senha não conferem.");
    }

    if (response.status === 401) {
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    let mensagem = `Erro na comunicação com a API (${response.status}).`;

    try {
      const erro = await response.json();

      mensagem = erro.message ?? erro.mensagem ?? erro.detail ?? mensagem;
    } catch {
      // A API não retornou um JSON válido.
    }

    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return null;
  }

  if (options.responseType === "arrayBuffer") {
    return await response.arrayBuffer();
  }

  if (options.responseType === "blob") {
    return await response.blob();
  }

  return await response.json();
}
