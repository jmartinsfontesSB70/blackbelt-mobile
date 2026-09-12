import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { apiFetch } from "./api";

const CHAVE_TOKEN_BIOMETRIA = "blackbelt-token-biometria";

export async function fazerLogin(identificador: string, password: string) {
  const resposta = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      identificador,
      password,
    }),
  });

  await AsyncStorage.setItem("token", resposta.token);

  return resposta;
}

export async function ativarLoginBiometrico(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN_BIOMETRIA, token, {
    requireAuthentication: true,
  });
}

export async function obterTokenBiometrico(): Promise<string | null> {
  return await SecureStore.getItemAsync(CHAVE_TOKEN_BIOMETRIA, {
    requireAuthentication: true,
  });
}

export async function desativarLoginBiometrico(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN_BIOMETRIA);
}

export async function solicitarRecuperacaoSenha(
  identificador: string,
): Promise<void> {
  await apiFetch("/recuperacao-senha", {
    method: "POST",
    headers: {
      "X-Client": "mobile",
    },
    body: JSON.stringify({
      identificador,
    }),
  });
}

export async function redefinirSenha(
  token: string,
  novaSenha: string,
): Promise<void> {
  await apiFetch("/recuperacao-senha/redefinir", {
    method: "POST",
    body: JSON.stringify({
      token,
      novaSenha,
    }),
  });
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
}
