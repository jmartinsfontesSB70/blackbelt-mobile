import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import MenuItem from "@/components/MenuItem";

export default function AdministracaoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Administração",
        }}
      />

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
