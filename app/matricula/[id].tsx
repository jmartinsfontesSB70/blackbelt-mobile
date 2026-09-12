import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { buscarMatricula, excluirMatricula } from "@/services/matriculaService";

export default function MatriculaDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [matricula, setMatricula] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarMatricula();
  }, [id]);

  async function carregarMatricula() {
    try {
      setMensagem("");

      const resposta = await buscarMatricula(id);

      setMatricula(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar matrícula.");
      }
    }
  }

  function formatarData(data?: string) {
    if (!data) {
      return "Não informada";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function confirmarExclusao() {
    Alert.alert(
      "Excluir matrícula",
      `Deseja realmente excluir a matrícula de ${matricula.alunoNome}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: executarExclusao,
        },
      ],
    );
  }

  async function executarExclusao() {
    try {
      setExcluindo(true);

      await excluirMatricula(Number(id));

      Alert.alert("Sucesso", "Matrícula excluída com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/matriculas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir a matrícula.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="MATRICULA_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!matricula) {
    return (
      <RotaPermissao permissao="MATRICULA_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando matrícula...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MATRICULA_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: "Matrícula",
          }}
        />

        <ScrollView
          style={styles.tela}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}

          <View style={styles.cabecalho}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {matricula.alunoNome?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>
                {matricula.alunoNome || "Aluno não informado"}
              </Text>

              <View
                style={[
                  styles.status,
                  matricula.ativa ? styles.statusAtivo : styles.statusInativo,
                ]}
              >
                <Text
                  style={[
                    styles.statusTexto,
                    matricula.ativa
                      ? styles.statusTextoAtivo
                      : styles.statusTextoInativo,
                  ]}
                >
                  {matricula.ativa ? "ATIVA" : "INATIVA"}
                </Text>
              </View>
            </View>
          </View>

          {/* Dados da matrícula */}

          <View style={styles.card}>
            <Text style={styles.secao}>Dados da matrícula</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Aluno</Text>

              <Text style={styles.valor}>
                {matricula.alunoNome || "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Turma</Text>

              <Text style={styles.valor}>
                {matricula.turmaNome || "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Data da matrícula</Text>

              <Text style={styles.valor}>
                {formatarData(matricula.dataMatricula)}
              </Text>
            </View>
          </View>

          {/* Situação */}

          <View style={styles.card}>
            <Text style={styles.secao}>Situação</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Status da matrícula</Text>

              <Text
                style={[
                  styles.valor,
                  matricula.ativa ? styles.valorAtivo : styles.valorInativo,
                ]}
              >
                {matricula.ativa ? "Ativa" : "Inativa"}
              </Text>
            </View>
          </View>

          {/* Ações */}

          <View style={styles.acoes}>
            <Permissao permissao="MATRICULA_EDITAR" esconder>
              <Pressable
                style={styles.botaoEditar}
                onPress={() => router.push(`/matricula/editar/${id}`)}
                disabled={excluindo}
              >
                <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
              </Pressable>
            </Permissao>

            <Permissao permissao="MATRICULA_EXCLUIR" esconder>
              <Pressable
                style={[
                  styles.botaoExcluir,
                  excluindo && styles.botaoDesabilitado,
                ]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator color="#F08A91" />
                ) : (
                  <Text style={styles.botaoExcluirTexto}>🗑️ Excluir</Text>
                )}
              </Pressable>
            </Permissao>
          </View>

          <Text style={styles.rodape}>BlackBelt</Text>
        </ScrollView>
      </>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarTexto: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  cabecalhoInfo: {
    flex: 1,
  },

  nome: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 7,
  },

  status: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },

  statusAtivo: {
    backgroundColor: "#12351F",
    borderColor: "#2A6B43",
  },

  statusInativo: {
    backgroundColor: "#3A171A",
    borderColor: "#5A2529",
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },

  statusTextoAtivo: {
    color: "#75D89A",
  },

  statusTextoInativo: {
    color: "#F08A91",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#242424",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  secao: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  campo: {
    borderBottomWidth: 1,
    borderBottomColor: "#2B2B2B",
    paddingVertical: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888888",
    marginBottom: 4,
  },

  valor: {
    fontSize: 16,
    color: "#FFFFFF",
  },

  valorAtivo: {
    color: "#75D89A",
    fontWeight: "600",
  },

  valorInativo: {
    color: "#F08A91",
    fontWeight: "600",
  },

  acoes: {
    marginTop: 4,
    marginBottom: 20,
    gap: 10,
  },

  botaoEditar: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoEditarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoExcluir: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#5A2529",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoExcluirTexto: {
    color: "#F08A91",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },

  carregandoTexto: {
    marginTop: 12,
    color: "#888888",
    fontSize: 15,
  },

  erroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0A0A0A",
  },

  erroTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },

  erro: {
    fontSize: 16,
    textAlign: "center",
    color: "#E04B55",
  },

  rodape: {
    textAlign: "center",
    marginTop: 8,
    color: "#888888",
    fontSize: 13,
  },
});
