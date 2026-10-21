import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import MenuItem from "@/components/MenuItem";
import Permissao from "@/components/Permissao";
import { buscarLogoAcademia } from "@/services/academiaService";

function arrayBufferParaBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const tamanhoBloco = 8192;
  let binario = "";

  for (let inicio = 0; inicio < bytes.length; inicio += tamanhoBloco) {
    const bloco = bytes.subarray(
      inicio,
      Math.min(inicio + tamanhoBloco, bytes.length),
    );

    binario += String.fromCharCode(...bloco);
  }

  return btoa(binario);
}

export default function FinanceiroScreen() {
  const router = useRouter();
  const [logoFundo, setLogoFundo] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarLogoFundo() {
        try {
          const buffer = await buscarLogoAcademia();
          const base64 = arrayBufferParaBase64(buffer);

          if (ativo) {
            setLogoFundo(`data:image/jpeg;base64,${base64}`);
          }
        } catch (error) {
          console.error(
            "Não foi possível carregar a logo de fundo do Financeiro:",
            error,
          );
        }
      }

      carregarLogoFundo();

      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      {logoFundo ? (
        <Image
          source={{ uri: logoFundo }}
          style={styles.logoFundo}
          resizeMode="cover"
          pointerEvents="none"
        />
      ) : null}

      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Financeiro</Text>

        <Text style={styles.descricao}>Gestão financeira da academia</Text>
      </View>

      {/* OPÇÕES */}
      <View style={styles.opcoes}>
        <Permissao permissao="TIPO_COBRANCA_LISTAR" esconder>
          <MenuItem
            titulo="Tipos de cobrança"
            onPress={() => router.push("/TiposCobranca")}
          />
        </Permissao>

        <Permissao permissao="COBRANCA_LISTAR" esconder>
          <MenuItem
            titulo="Cobranças"
            onPress={() => router.push("/cobrancas")}
          />
        </Permissao>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#0A0A0A",
  },

  logoFundo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },

  cabecalho: {
    marginBottom: 28,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  descricao: {
    color: "#777777",
    fontSize: 14,
    marginTop: 5,
  },

  opcoes: {
    gap: 10,
  },
});
