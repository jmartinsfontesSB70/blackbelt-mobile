import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import MenuItem from "@/components/MenuItem";
import { buscarLogoAcademia } from "@/services/academiaService";

function arrayBufferParaBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";

  for (let i = 0; i < bytes.length; i += 8192) {
    binario += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + 8192, bytes.length)),
    );
  }

  return btoa(binario);
}

export default function AdministracaoScreen() {
  const router = useRouter();
  const [logoFundo, setLogoFundo] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarLogo() {
        try {
          const buffer = await buscarLogoAcademia();
          const base64 = arrayBufferParaBase64(buffer);

          if (ativo) {
            setLogoFundo(`data:image/jpeg;base64,${base64}`);
          }
        } catch {
          if (ativo) {
            setLogoFundo(null);
          }
        }
      }

      carregarLogo();

      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Administração",
        }}
      />

      {logoFundo ? (
        <Image
          source={{ uri: logoFundo }}
          style={styles.logoFundo}
          resizeMode="cover"
          pointerEvents="none"
        />
      ) : null}

      <Text style={styles.titulo}>Administração</Text>

      <Text style={styles.subtitulo}>Configurações administrativas</Text>

      <MenuItem titulo="Usuários" onPress={() => router.push("/usuarios")} />

      <MenuItem titulo="Perfis" onPress={() => router.push("/perfis")} />

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <Text style={styles.footerTexto}>
          BLACKBELT • GESTÃO PARA ACADEMIAS
        </Text>

        <Text style={styles.footerVersao}>Versão 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 35,
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

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 15,
    color: "#888888",
    marginBottom: 30,
  },

  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 35,
  },

  footerTexto: {
    color: "#444444",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  footerVersao: {
    color: "#333333",
    fontSize: 10,
    marginTop: 5,
  },
});
