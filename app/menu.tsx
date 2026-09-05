import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import MenuItem from "@/components/MenuItem";
import { logout } from "@/services/authService";
import { obterPermissoes } from "@/services/permissions";

export default function MenuScreen() {
  const router = useRouter();

  const [permissoes, setPermissoes] = useState<string[]>([]);

  useEffect(() => {
    async function carregarPermissoes() {
      const resultado = await obterPermissoes();

      setPermissoes(resultado);
    }

    carregarPermissoes();
  }, []);

  function pode(permissao: string) {
    return permissoes.includes(permissao);
  }

  function confirmarSaida() {
    Alert.alert("Sair", "Deseja realmente sair do sistema?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: executarSaida,
      },
    ]);
  }

  async function executarSaida() {
    await logout();

    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>BLACKBELT</Text>

        <Text style={styles.subtitulo}>Gestão para academias</Text>

        <Text style={styles.titulo}>Menu</Text>

        {pode("ALUNO_LISTAR") && (
          <MenuItem titulo="Alunos" onPress={() => router.push("/alunos")} />
        )}

        {pode("PROFESSOR_LISTAR") && (
          <MenuItem
            titulo="Professores"
            onPress={() => router.push("/professores")}
          />
        )}

        {pode("MODALIDADE_LISTAR") && (
          <MenuItem
            titulo="Modalidades"
            onPress={() => router.push("/modalidades")}
          />
        )}

        {pode("TURMA_LISTAR") && (
          <MenuItem titulo="Turmas" onPress={() => router.push("/turmas")} />
        )}

        {pode("MATRICULA_LISTAR") && (
          <MenuItem
            titulo="Matrículas"
            onPress={() => router.push("/matriculas")}
          />
        )}

        {pode("PRESENCA_LISTAR") && (
          <MenuItem
            titulo="Presenças"
            onPress={() => router.push("/presencas")}
          />
        )}

        <MenuItem
          titulo="Alterar senha"
          onPress={() => router.push("/alterar-senha")}
        />

        {(pode("USUARIO_LISTAR") || pode("PERFIL_LISTAR")) && (
          <MenuItem
            titulo="Administração"
            onPress={() => router.push("/administracao")}
          />
        )}

        <MenuItem titulo="Sair" onPress={confirmarSaida} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  scrollContent: {
    paddingTop: 70,
    paddingBottom: 40,
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
