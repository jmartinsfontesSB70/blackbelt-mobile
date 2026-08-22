export function formatarCpf(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 3) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return numeros.replace(/(\d{3})(\d+)/, "$1.$2");
  }

  if (numeros.length <= 9) {
    return numeros.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  }

  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 7) {
    return numeros.replace(/(\d{2})(\d+)/, "($1) $2");
  }

  return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export function formatarCep(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 5) {
    return numeros;
  }

  return numeros.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatarDataExibicao(data: string): string {
  if (!data) {
    return "";
  }

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}/${ano}`;
}

export function formatarData(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return numeros.replace(/(\d{2})(\d+)/, "$1/$2");
  }

  return numeros.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
}

export function formatarDataParaApi(valor: string) {
  const [dia, mes, ano] = valor.split("/");

  return `${ano}-${mes}-${dia}`;
}
