import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { listarHistoricoGraduacaoPorAluno } from "@/services/historicoGraduacaoService";

export default function HistoricoGraduacaoScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [historico, setHistorico] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  const carregarHistorico = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      const dados = await listarHistoricoGraduacaoPorAluno(id);

      setHistorico(dados);
    } catch (error: any) {
      setMensagem(
        error?.message || "Não foi possível carregar o histórico de graduação.",
      );
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico]),
  );

  const formatarData = (data: string) => {
    if (!data) {
      return "";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cabecalhoCard}>
          <Text style={styles.modalidade}>{item.modalidadeNome}</Text>

          <Text style={styles.data}>{formatarData(item.data)}</Text>
        </View>

        <Text style={styles.graduacao}>{item.graduacaoNome}</Text>

        <View style={styles.linha}>
          <Text style={styles.rotulo}>Grau:</Text>

          <Text style={styles.valor}>
            {item.grau === 0 ? "Graduação" : `${item.grau}º grau`}
          </Text>
        </View>

        {item.observacao ? (
          <View style={styles.observacaoContainer}>
            <Text style={styles.rotulo}>Observação:</Text>

            <Text style={styles.observacao}>{item.observacao}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <RotaPermissao permissao="ALUNO_LISTAR">
      <Stack.Screen
        options={{
          title: "Histórico de Graduação",
        }}
      />

      <View style={styles.container}>
        <View style={styles.topo}>
          <Text style={styles.titulo}>📜 Histórico de Graduação</Text>

          <Permissao permissao="ALUNO_EDITAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() =>
                router.push(`/aluno/${id}/historico-graduacao/novo`)
              }
            >
              <Text style={styles.botaoNovoTexto}>+ Registrar</Text>
            </Pressable>
          </Permissao>
        </View>

        {carregando ? (
          <View style={styles.centralizado}>
            <ActivityIndicator size="large" />

            <Text style={styles.carregando}>Carregando histórico...</Text>
          </View>
        ) : mensagem ? (
          <View style={styles.centralizado}>
            <Text style={styles.mensagem}>{mensagem}</Text>
          </View>
        ) : historico.length === 0 ? (
          <View style={styles.centralizado}>
            <Text style={styles.vazio}>
              Nenhum histórico de graduação registrado.
            </Text>
          </View>
        ) : (
          <FlatList
            data={historico}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.lista}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 16,
  },

  topo: {
    marginBottom: 16,
    gap: 12,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  botaoNovo: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoNovoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  lista: {
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 16,
    marginBottom: 12,
  },

  cabecalhoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  modalidade: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
  },

  data: {
    color: "#AAAAAA",
    fontSize: 14,
  },

  graduacao: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
  },

  rotulo: {
    color: "#AAAAAA",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 6,
  },

  valor: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  observacaoContainer: {
    marginTop: 12,
  },

  observacao: {
    color: "#CCCCCC",
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },

  centralizado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  carregando: {
    color: "#AAAAAA",
    marginTop: 12,
    fontSize: 15,
  },

  mensagem: {
    color: "#FF6B6B",
    textAlign: "center",
    fontSize: 15,
  },

  vazio: {
    color: "#AAAAAA",
    textAlign: "center",
    fontSize: 15,
  },
});
