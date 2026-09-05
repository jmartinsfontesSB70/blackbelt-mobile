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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 15,
    marginBottom: 30,
  },
});
