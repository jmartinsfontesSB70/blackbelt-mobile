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
  buscarGraduacaoPorId,
  excluirGraduacao,
} from "@/services/graduacaoService";

export default function GraduacaoDetalhesScreen() {
  const router = useRouter();

  const { id, graduacaoId } = useLocalSearchParams<{
    id: string;
    graduacaoId: string;
  }>();

  const [graduacao, setGraduacao] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarGraduacao();
  }, [graduacaoId]);

  async function carregarGraduacao() {
    try {
      setMensagem("");

      const resposta = await buscarGraduacaoPorId(graduacaoId);

      setGraduacao(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar graduação.");
      }
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      "Excluir graduação",
      `Deseja realmente excluir ${graduacao.nome}?`,
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

      await excluirGraduacao(Number(graduacaoId));

      Alert.alert("Sucesso", "Graduação excluída com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo(`/modalidade/${id}/graduacoes`),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir a graduação.");
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

  if (!graduacao) {
    return (
      <RotaPermissao permissao="MODALIDADE_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando graduação...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MODALIDADE_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: graduacao.nome,
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
              <Text style={styles.avatarTexto}>🥋</Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>{graduacao.nome}</Text>

              <Text style={styles.modalidade}>{graduacao.modalidadeNome}</Text>
            </View>
          </View>

          {/* Dados da graduação */}

          <View style={styles.card}>
            <View style={styles.tituloSecao}>
              <View style={styles.iconeSecao}>
                <Text style={styles.iconeTexto}>🎓</Text>
              </View>

              <View>
                <Text style={styles.secao}>Dados da graduação</Text>

                <Text style={styles.descricaoSecao}>
                  Informações da graduação
                </Text>
              </View>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Nome</Text>

              <Text style={styles.valor}>{graduacao.nome}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Modalidade</Text>

              <Text style={styles.valor}>{graduacao.modalidadeNome}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Ordem</Text>

              <Text style={styles.valor}>{graduacao.ordem}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Quantidade de graus</Text>

              <Text style={styles.valor}>{graduacao.quantidadeGraus}</Text>
            </View>
          </View>

          {/* Ações */}

          <View style={styles.acoes}>
            <Permissao permissao="MODALIDADE_EDITAR" esconder>
              <Pressable
                style={styles.botaoEditar}
                onPress={() =>
                  router.push(
                    `/modalidade/${id}/graduacoes/${graduacaoId}/editar`,
                  )
                }
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
    backgroundColor: "#0A0A0A",
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
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarTexto: {
    fontSize: 28,
  },

  cabecalhoInfo: {
    flex: 1,
  },

  nome: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  modalidade: {
    fontSize: 14,
    color: "#888888",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 18,
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

  tituloSecao: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  iconeSecao: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
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
    color: "#FFFFFF",
  },

  descricaoSecao: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
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
    color: "#555555",
    fontSize: 13,
  },
});
