import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { listarGraduacoesPorModalidade } from "@/services/graduacaoService";

import { buscarModalidade } from "@/services/modalidadeService";

import RotaPermissao from "@/components/RotaPermissao";

export default function GraduacoesScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [graduacoes, setGraduacoes] = useState<any[]>([]);
  const [modalidade, setModalidade] = useState<any>(null);

  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  const carregarDados = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      const [dadosGraduacoes, dadosModalidade] = await Promise.all([
        listarGraduacoesPorModalidade(id),
        buscarModalidade(id),
      ]);

      setGraduacoes(dadosGraduacoes);
      setModalidade(dadosModalidade);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar graduações.");
      }
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  function abrirGraduacao(graduacaoId: number) {
    router.push(`/modalidade/${id}/graduacoes/${graduacaoId}`);
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

  if (carregando) {
    return (
      <RotaPermissao permissao="MODALIDADE_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando graduações...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MODALIDADE_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: modalidade?.nome
              ? `Graduações - ${modalidade.nome}`
              : "Graduações",
          }}
        />

        <View style={styles.tela}>
          <FlatList
            data={graduacoes}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <View style={styles.cabecalho}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>🥋</Text>
                  </View>

                  <View style={styles.cabecalhoInfo}>
                    <Text style={styles.titulo}>Graduações</Text>

                    <Text style={styles.subtitulo}>
                      {modalidade ? modalidade.nome : "Modalidade"}
                    </Text>
                  </View>
                </View>

                <View style={styles.acoesCabecalho}>
                  <Pressable
                    style={styles.botaoVoltar}
                    onPress={() => router.back()}
                  >
                    <Text style={styles.botaoVoltarTexto}>← Voltar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.botaoNova}
                    onPress={() =>
                      router.push(`/modalidade/${id}/graduacoes/novo`)
                    }
                  >
                    <Text style={styles.botaoNovaTexto}>+ Nova</Text>
                  </Pressable>
                </View>
              </>
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressionado,
                ]}
                onPress={() => abrirGraduacao(item.id)}
              >
                <View style={styles.cardConteudo}>
                  <View style={styles.ordemContainer}>
                    <Text style={styles.ordem}>{item.ordem}</Text>
                  </View>

                  <View style={styles.informacoes}>
                    <Text style={styles.nome}>{item.nome}</Text>

                    <Text style={styles.graus}>
                      Quantidade de graus: {item.quantidadeGraus}
                    </Text>
                  </View>

                  <Text style={styles.seta}>›</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.vazioContainer}>
                <Text style={styles.vazio}>
                  Nenhuma graduação cadastrada para esta modalidade.
                </Text>
              </View>
            }
          />
        </View>
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
    marginBottom: 18,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarTexto: {
    fontSize: 25,
  },

  cabecalhoInfo: {
    flex: 1,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  subtitulo: {
    marginTop: 4,
    color: "#888888",
    fontSize: 15,
  },

  acoesCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  botaoVoltar: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoVoltarTexto: {
    color: "#BBBBBB",
    fontSize: 14,
    fontWeight: "600",
  },

  botaoNova: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoNovaTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
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

  cardPressionado: {
    opacity: 0.7,
  },

  cardConteudo: {
    flexDirection: "row",
    alignItems: "center",
  },

  ordemContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
  },

  ordem: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  informacoes: {
    flex: 1,
    marginLeft: 12,
  },

  nome: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  graus: {
    marginTop: 5,
    color: "#888888",
    fontSize: 14,
  },

  seta: {
    color: "#888888",
    fontSize: 30,
    marginLeft: 8,
  },

  vazioContainer: {
    paddingVertical: 30,
  },

  vazio: {
    color: "#888888",
    fontSize: 15,
    textAlign: "center",
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
});
