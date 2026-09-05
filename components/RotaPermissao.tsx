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
    async function verificar() {
      try {
        const permitido = await temPermissao(permissao);

        setAutorizado(permitido);
      } finally {
        setVerificando(false);
      }
    }

    verificar();
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
