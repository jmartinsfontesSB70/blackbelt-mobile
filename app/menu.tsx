import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.logoMarca}>
            <Text style={styles.logoMarcaTexto}>B</Text>
          </View>

          <View style={styles.logoContainer}>
            <Text style={styles.logo}>BLACKBELT</Text>
            <Text style={styles.subtitulo}>GESTÃO PARA ACADEMIAS</Text>
          </View>
        </View>

        {/* TÍTULO */}
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Menu</Text>
          <Text style={styles.descricao}>
            Acesse os recursos da sua academia
          </Text>
        </View>

        {/* CADASTROS */}
        <Text style={styles.secao}>GESTÃO</Text>

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

        {/* CONTA */}
        <Text style={styles.secao}>CONTA</Text>

        <MenuItem
          titulo="Alterar senha"
          onPress={() => router.push("/alterar-senha")}
        />

        {/* ADMINISTRAÇÃO */}
        {(pode("USUARIO_LISTAR") || pode("PERFIL_LISTAR")) && (
          <>
            <Text style={styles.secao}>ADMINISTRAÇÃO</Text>

            <MenuItem
              titulo="Administração"
              onPress={() => router.push("/administracao")}
            />
          </>
        )}

        {/* SAIR */}
        <View style={styles.saidaContainer}>
          <TouchableOpacity
            style={styles.botaoSair}
            activeOpacity={0.8}
            onPress={confirmarSaida}
          >
            <Text style={styles.textoSair}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>
            BLACKBELT • GESTÃO PARA ACADEMIAS
          </Text>
          <Text style={styles.footerVersao}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  // HEADER

  header: {
    alignItems: "center",
    marginBottom: 38,
  },

  logoMarca: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  logoMarcaTexto: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },

  logoContainer: {
    alignItems: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 3,
  },

  subtitulo: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginTop: 5,
  },

  // TÍTULO

  tituloContainer: {
    marginBottom: 24,
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

  // SEÇÕES

  secao: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 18,
    marginBottom: 10,
  },

  // SAÍDA

  saidaContainer: {
    marginTop: 28,
  },

  botaoSair: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A1719",
    backgroundColor: "#160D0E",
    alignItems: "center",
    justifyContent: "center",
  },

  textoSair: {
    color: "#E04B55",
    fontSize: 16,
    fontWeight: "700",
  },

  // FOOTER

  footer: {
    alignItems: "center",
    marginTop: 35,
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
