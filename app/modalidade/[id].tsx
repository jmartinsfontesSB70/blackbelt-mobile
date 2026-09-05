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

import {
  buscarModalidade,
  excluirModalidade,
} from "@/services/modalidadeService";

export default function ModalidadeDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [modalidade, setModalidade] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarModalidade();
  }, [id]);

  async function carregarModalidade() {
    try {
      setMensagem("");

      const resposta = await buscarModalidade(id);

      setModalidade(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar modalidade.");
      }
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      "Excluir modalidade",
      `Deseja realmente excluir ${modalidade.nome}?`,
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

      await excluirModalidade(Number(id));

      Alert.alert("Sucesso", "Modalidade excluída com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/modalidades"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir a modalidade.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="MODALIDADE_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!modalidade) {
    return (
      <RotaPermissao permissao="MODALIDADE_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando modalidade...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MODALIDADE_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: modalidade.nome,
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
                {modalidade.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>{modalidade.nome}</Text>

              <View
                style={[
                  styles.status,
                  modalidade.ativa ? styles.statusAtiva : styles.statusInativa,
                ]}
              >
                <Text
                  style={[
                    styles.statusTexto,
                    modalidade.ativa
                      ? styles.statusTextoAtiva
                      : styles.statusTextoInativa,
                  ]}
                >
                  {modalidade.ativa ? "ATIVA" : "INATIVA"}
                </Text>
              </View>
            </View>
          </View>

          {/* Dados da modalidade */}

          <View style={styles.card}>
            <View style={styles.tituloSecao}>
              <View style={styles.iconeSecao}>
                <Text style={styles.iconeTexto}>🥋</Text>
              </View>

              <View>
                <Text style={styles.secao}>Dados da modalidade</Text>

                <Text style={styles.descricaoSecao}>
                  Informações da modalidade
                </Text>
              </View>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Nome</Text>

              <Text style={styles.valor}>{modalidade.nome}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Descrição</Text>

              <Text style={styles.valor}>
                {modalidade.descricao || "Não informada"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Situação</Text>

              <Text style={styles.valor}>
                {modalidade.ativa ? "Ativa" : "Inativa"}
              </Text>
            </View>
          </View>

          {/* Ações */}

          <View style={styles.acoes}>
            <Permissao permissao="MODALIDADE_EDITAR" esconder>
              <Pressable
                style={styles.botaoEditar}
                onPress={() => router.push(`/modalidade/editar/${id}`)}
                disabled={excluindo}
              >
                <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
              </Pressable>
            </Permissao>

            <Permissao permissao="MODALIDADE_EXCLUIR" esconder>
              <Pressable
                style={[
                  styles.botaoExcluir,
                  excluindo && styles.botaoDesabilitado,
                ]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator />
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
    backgroundColor: "#f5f6f8",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarTexto: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },

  cabecalhoInfo: {
    flex: 1,
  },

  nome: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 7,
  },

  status: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusAtiva: {
    backgroundColor: "#dcfce7",
  },

  statusInativa: {
    backgroundColor: "#fee2e2",
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },

  statusTextoAtiva: {
    color: "#166534",
  },

  statusTextoInativa: {
    color: "#991b1b",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  tituloSecao: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  iconeSecao: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconeTexto: {
    fontSize: 20,
  },

  secao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  descricaoSecao: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },

  campo: {
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },

  valor: {
    fontSize: 16,
    color: "#111827",
  },

  acoes: {
    marginTop: 4,
    marginBottom: 20,
    gap: 10,
  },

  botaoEditar: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoEditarTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoExcluir: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoExcluirTexto: {
    color: "#b91c1c",
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
    backgroundColor: "#f5f6f8",
  },

  carregandoTexto: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 15,
  },

  erroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f6f8",
  },

  erroTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },

  erro: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
  },

  rodape: {
    textAlign: "center",
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 13,
  },
});
