import { useEffect, useState } from "react";
import { View } from "react-native";

import { temPermissao } from "@/services/permissions";

type Props = {
  permissao: string;
  children: React.ReactNode;
  esconder?: boolean;
};

export default function Permissao({
  permissao,
  children,
  esconder = false,
}: Props) {
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);

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
    return null;
  }

  if (!autorizado && esconder) {
    return null;
  }

  if (!autorizado) {
    return (
      <View
        style={{
          opacity: 0.5,
        }}
      >
        {children}
      </View>
    );
  }

  return <>{children}</>;
}
