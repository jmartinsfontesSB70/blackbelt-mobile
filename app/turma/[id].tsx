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

import { buscarTurma, excluirTurma } from "@/services/turmaService";

export default function TurmaDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [turma, setTurma] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarTurma();
  }, [id]);

  async function carregarTurma() {
    try {
      setMensagem("");

      const turma = await buscarTurma(id);

      setTurma(turma);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar turma.");
      }
    }
  }

  function formatarHorario(horario?: string) {
    if (!horario) {
      return "Não informado";
    }

    return horario.substring(0, 5);
  }

  function confirmarExclusao() {
    Alert.alert("Excluir turma", `Deseja realmente excluir ${turma.nome}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: executarExclusao,
      },
    ]);
  }

  async function executarExclusao() {
    try {
      setExcluindo(true);

      await excluirTurma(Number(id));

      Alert.alert("Sucesso", "Turma excluída com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/turmas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir a turma.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="TURMA_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!turma) {
    return (
      <RotaPermissao permissao="TURMA_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando turma...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="TURMA_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: turma.nome,
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
                {turma.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>{turma.nome}</Text>

              <View
                style={[
                  styles.status,
                  turma.ativa ? styles.statusAtivo : styles.statusInativo,
                ]}
              >
                <Text
                  style={[
                    styles.statusTexto,
                    turma.ativa
                      ? styles.statusTextoAtivo
                      : styles.statusTextoInativo,
                  ]}
                >
                  {turma.ativa ? "ATIVA" : "INATIVA"}
                </Text>
              </View>
            </View>
          </View>

          {/* Dados da turma */}

          <View style={styles.card}>
            <Text style={styles.secao}>Dados da turma</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Modalidade</Text>

              <Text style={styles.valor}>
                {turma.modalidadeNome || "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Professor</Text>

              <Text style={styles.valor}>
                {turma.professorNome || "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Dias da semana</Text>

              <Text style={styles.valor}>
                {turma.diasSemana || "Não informado"}
              </Text>
            </View>
          </View>

          {/* Horários */}

          <View style={styles.card}>
            <Text style={styles.secao}>Horários</Text>

            <View style={styles.linhaHorario}>
              <View style={styles.horario}>
                <Text style={styles.label}>Início</Text>

                <Text style={styles.valor}>
                  {formatarHorario(turma.horarioInicio)}
                </Text>
              </View>

              <View style={styles.horario}>
                <Text style={styles.label}>Término</Text>

                <Text style={styles.valor}>
                  {formatarHorario(turma.horarioFim)}
                </Text>
              </View>
            </View>
          </View>

          {/* Capacidade */}

          <View style={styles.card}>
            <Text style={styles.secao}>Capacidade</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Número máximo de alunos</Text>

              <Text style={styles.valor}>
                {turma.capacidade != null
                  ? `${turma.capacidade} aluno(s)`
                  : "Não informado"}
              </Text>
            </View>
          </View>

          {/* Ações */}

          <View style={styles.acoes}>
            <Permissao permissao="TURMA_EDITAR" esconder>
              <Pressable
                style={styles.botaoEditar}
                onPress={() => router.push(`/turma/editar/${id}`)}
                disabled={excluindo}
              >
                <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
              </Pressable>
            </Permissao>

            <Permissao permissao="TURMA_EXCLUIR" esconder>
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

  linhaHorario: {
    flexDirection: "row",
    gap: 20,
  },

  horario: {
    flex: 1,
    paddingVertical: 10,
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
