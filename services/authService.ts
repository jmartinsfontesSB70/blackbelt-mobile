import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiFetch } from "./api";

export async function fazerLogin(username: string, password: string) {
  const resposta = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  await AsyncStorage.setItem("token", resposta.token);

  return resposta;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
}
