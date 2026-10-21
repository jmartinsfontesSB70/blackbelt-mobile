import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { temPermissao } from "@/services/permissions";

type Props = {
  permissao: string;
  children: React.ReactNode;
};

export default function RotaPermissao({ permissao, children }: Props) {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      try {
        const permitido = await temPermissao(permissao);

        if (ativo) {
          setAutorizado(permitido);
        }
      } catch (error) {
        console.error("Erro ao verificar permissão:", error);

        if (ativo) {
          setAutorizado(false);
        }
      } finally {
        if (ativo) {
          setVerificando(false);
        }
      }
    }

    setVerificando(true);
    verificar();

    return () => {
      ativo = false;
    };
  }, [permissao]);

  if (verificando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!autorizado) {
    return <Redirect href="/menu" />;
  }

  return <>{children}</>;
}
