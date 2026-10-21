import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const API_URL = "http://192.168.1.4:8080/api/v1";
// const API_URL = "http://localhost:8080/api/v1";

const ENDPOINTS_PUBLICOS = [
  "/login",
  "/recuperacao-senha",
  "/recuperacao-senha/redefinir",
  "/academia/status-instalacao",
  "/academia/instalacao",
  "/licenca/ativar",
];

let redirecionandoParaLogin = false;

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

  if (token && !ENDPOINTS_PUBLICOS.includes(endpoint)) {
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
      await AsyncStorage.removeItem("token");

      if (!redirecionandoParaLogin) {
        redirecionandoParaLogin = true;

        Alert.alert(
          "Sessão expirada",
          "Sua sessão expirou. Faça login novamente.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/");
                redirecionandoParaLogin = false;
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      }

      throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    let mensagem = `Erro na comunicação com a API (${response.status}).`;
    let codigo = "";

    try {
      const erro = await response.json();

      mensagem = erro.message ?? erro.mensagem ?? erro.detail ?? mensagem;
      codigo = erro.codigo ?? "";
    } catch {
      // A API não retornou um JSON válido.
    }

    if (response.status === 423 && codigo === "LICENCA_EXPIRADA") {
      router.replace({
        pathname: "/licenca/ativar",
        params: { mensagem },
      });

      throw new Error(mensagem);
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
