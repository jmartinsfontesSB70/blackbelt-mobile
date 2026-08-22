import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.4:8080/api/v1";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (options.body && !headers["Content-Type"]) {
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

  return await response.json();
}
