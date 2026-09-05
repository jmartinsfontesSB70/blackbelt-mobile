import AsyncStorage from "@react-native-async-storage/async-storage";

type JwtPayload = {
  authorities?: string[];
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decoded = globalThis.atob(base64);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function obterPermissoes(): Promise<string[]> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return [];
  }

  const payload = decodeJwtPayload(token);

  return payload?.authorities ?? [];
}

export async function temPermissao(permissao: string): Promise<boolean> {
  const permissoes = await obterPermissoes();

  return permissoes.includes(permissao);
}

export async function temAlgumaPermissao(
  permissoesNecessarias: string[],
): Promise<boolean> {
  const permissoes = await obterPermissoes();

  return permissoesNecessarias.some((permissao) =>
    permissoes.includes(permissao),
  );
}
