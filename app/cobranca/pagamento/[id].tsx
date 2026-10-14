import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { excluirPagamento, listarPagamentos } from "@/services/cobrancaService";

type Pagamento = {
  id: number;
  cobrancaId: number;
  dataPagamento: string;
  valor: number;
  formaPagamento: string;
  observacao?: string;
};

export default function PagamentoDetalheScreen() {
  const { id, cobrancaId } = useLocalSearchParams<{
    id: string;
    cobrancaId: string;
  }>();

  const router = useRouter();

  const [pagamento, setPagamento] = useState<Pagamento | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  const carregarPagamento = useCallback(async () => {
    try {
      setCarregando(true);

      const pagamentos = await listarPagamentos(cobrancaId);

      const encontrado = pagamentos.find(
        (item: Pagamento) => item.id.toString() === id,
      );

      setPagamento(encontrado ?? null);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message ?? "Não foi possível carregar o pagamento.",
      );
    } finally {
      setCarregando(false);
    }
  }, [id, cobrancaId]);

  useEffect(() => {
    carregarPagamento();
  }, [carregarPagamento]);

  function formatarData(data: string) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  function formatarMoeda(valor: number) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function obterFormaPagamento(forma: string) {
    switch (forma) {
      case "DINHEIRO":
        return "Dinheiro";

      case "PIX":
        return "PIX";

      case "CARTAO_CREDITO":
        return "Cartão de crédito";

      case "CARTAO_DEBITO":
        return "Cartão de débito";

      case "TRANSFERENCIA":
        return "Transferência";

      default:
        return forma;
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      "Excluir pagamento",
      "Deseja realmente excluir este pagamento?",
      [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: excluir,
        },
      ],
    );
  }

  async function excluir() {
    try {
      setExcluindo(true);

      await excluirPagamento(cobrancaId, id);

      Alert.alert("Sucesso", "Pagamento excluído com sucesso.", [
        {
          text: "OK",
          onPress: () => router.dismissTo(`/cobranca/pagamentos/${cobrancaId}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message ?? "Não foi possível excluir o pagamento.",
      );
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Pagamento",
            headerBackTitle: "Voltar",
          }}
        />

        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </>
    );
  }

  if (!pagamento) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Pagamento",
            headerBackTitle: "Voltar",
          }}
        />

        <View style={styles.container}>
          <Text style={styles.mensagem}>Pagamento não encontrado.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Pagamento",
          headerBackTitle: "Voltar",
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
      >
        <View style={styles.cabecalho}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {obterFormaPagamento(pagamento.formaPagamento)
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoCabecalho}>
            <Text style={styles.titulo}>Pagamento</Text>

            <Text style={styles.formaPagamento}>
              {obterFormaPagamento(pagamento.formaPagamento)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Data do pagamento</Text>

          <Text style={styles.valor}>
            {formatarData(pagamento.dataPagamento)}
          </Text>

          <Text style={styles.label}>Valor</Text>

          <Text style={styles.valorPagamento}>
            {formatarMoeda(pagamento.valor)}
          </Text>

          <Text style={styles.label}>Forma de pagamento</Text>

          <Text style={styles.valor}>
            {obterFormaPagamento(pagamento.formaPagamento)}
          </Text>

          {pagamento.observacao ? (
            <>
              <Text style={styles.label}>Observação</Text>

              <Text style={styles.valor}>{pagamento.observacao}</Text>
            </>
          ) : null}
        </View>

        <View style={styles.acoes}>
          <Permissao permissao="PAGAMENTO_EXCLUIR" esconder>
            <Pressable
              style={styles.botaoExcluir}
              onPress={confirmarExclusao}
              disabled={excluindo}
            >
              <Text style={styles.textoBotaoExcluir}>
                {excluindo ? "Excluindo..." : "Excluir pagamento"}
              </Text>
            </Pressable>
          </Permissao>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  conteudo: {
    padding: 16,
    paddingBottom: 80,
  },

  carregando: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  avatarTexto: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  infoCabecalho: {
    flex: 1,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  formaPagamento: {
    color: "#D0D0D0",
    fontSize: 15,
  },

  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
  },

  label: {
    color: "#9E9E9E",
    fontSize: 13,
    marginTop: 12,
    marginBottom: 4,
  },

  valor: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  valorPagamento: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  acoes: {
    marginTop: 20,
  },

  botaoExcluir: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  textoBotaoExcluir: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  mensagem: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
