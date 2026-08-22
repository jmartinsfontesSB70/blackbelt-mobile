import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import MenuItem from "@/components/MenuItem";

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BLACKBELT</Text>

      <Text style={styles.subtitulo}>Gestão para academias</Text>

      <Text style={styles.titulo}>Menu</Text>

      <MenuItem titulo="Alunos" onPress={() => router.push("/alunos")} />

      <MenuItem
        titulo="Professores"
        onPress={() => router.push("/professores")}
      />

      <MenuItem titulo="Modalidades" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  logo: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2,
  },

  subtitulo: {
    textAlign: "center",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 40,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
