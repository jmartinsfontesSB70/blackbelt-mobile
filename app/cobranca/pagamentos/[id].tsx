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

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";
import { buscarCobranca, listarPagamentos } from "@/services/cobrancaService";

type Cobranca = {
  id: number;
  alunoNome: string;
  tipoCobrancaNome: string;
  descricao: string;
  valor: number;
  status: string;
};

type Pagamento = {
  id: number;
  cobrancaId: number;
  dataPagamento: string;
  valor: number;
  formaPagamento: string;
  observacao?: string;
};

export default function PagamentosCobrancaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [cobranca, setCobranca] = useState<Cobranca | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);

      const [dadosCobranca, dadosPagamentos] = await Promise.all([
        buscarCobranca(id),
        listarPagamentos(id),
      ]);

      setCobranca(dadosCobranca);
      setPagamentos(dadosPagamentos);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

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

  function obterInicial(forma: string) {
    return obterFormaPagamento(forma).charAt(0).toUpperCase();
  }

  function novoPagamento() {
    router.push(`/cobranca/pagamento/novo?cobrancaId=${id}`);
  }

  function abrirPagamento(pagamento: Pagamento) {
    router.push(
      `/cobranca/pagamento/${pagamento.id}?cobrancaId=${pagamento.cobrancaId}`,
    );
  }

  if (carregando && !cobranca) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Pagamentos",
            headerBackTitle: "Voltar",
          }}
        />

        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </>
    );
  }

  if (!cobranca) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Pagamentos",
            headerBackTitle: "Voltar",
          }}
        />

        <View style={styles.container}>
          <Text style={styles.mensagem}>Cobrança não encontrada.</Text>
        </View>
      </>
    );
  }

  return (
    <RotaPermissao permissao="PAGAMENTO_LISTAR">
      <Stack.Screen
        options={{
          title: "Pagamentos",
          headerBackTitle: "Voltar",
        }}
      />

      <View style={styles.container}>
        <FlatList
          data={pagamentos}
          keyExtractor={(item) => item.id.toString()}
          refreshing={carregando}
          onRefresh={carregarDados}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <>
              <View style={styles.cabecalho}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>
                    {cobranca.alunoNome
                      ? cobranca.alunoNome.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>

                <View style={styles.infoCabecalho}>
                  <Text style={styles.alunoNome}>{cobranca.alunoNome}</Text>

                  <Text style={styles.descricao}>{cobranca.descricao}</Text>

                  <Text style={styles.tipoCobranca}>
                    {cobranca.tipoCobrancaNome}
                  </Text>
                </View>
              </View>

              <View style={styles.resumo}>
                <View style={styles.resumoItem}>
                  <Text style={styles.labelResumo}>Valor da cobrança</Text>

                  <Text style={styles.valorResumo}>
                    {formatarMoeda(cobranca.valor)}
                  </Text>
                </View>

                <View style={styles.divisorResumo} />

                <View style={styles.resumoItem}>
                  <Text style={styles.labelResumo}>Pagamentos</Text>

                  <Text style={styles.valorResumo}>{pagamentos.length}</Text>
                </View>
              </View>

              <View style={styles.tituloLista}>
                <Text style={styles.tituloSecao}>Pagamentos</Text>

                <Text style={styles.quantidade}>{pagamentos.length}</Text>
              </View>

              <Permissao permissao="PAGAMENTO_CADASTRAR" esconder>
                {cobranca.status !== "CANCELADO" &&
                cobranca.status !== "PAGO" ? (
                  <Pressable style={styles.botaoNovo} onPress={novoPagamento}>
                    <Text style={styles.textoBotaoNovo}>Novo pagamento</Text>
                  </Pressable>
                ) : null}
              </Permissao>
            </>
          }
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>
                Nenhum pagamento registrado
              </Text>

              <Text style={styles.vazioDescricao}>
                Ainda não existem pagamentos para esta cobrança.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.cardPagamento}
              onPress={() => abrirPagamento(item)}
            >
              <View style={styles.avatarPagamento}>
                <Text style={styles.avatarPagamentoTexto}>
                  {obterInicial(item.formaPagamento)}
                </Text>
              </View>

              <View style={styles.infoPagamento}>
                <Text style={styles.valorPagamento}>
                  {formatarMoeda(item.valor)}
                </Text>

                <Text style={styles.formaPagamento}>
                  {obterFormaPagamento(item.formaPagamento)}
                </Text>

                <Text style={styles.dataPagamento}>
                  {formatarData(item.dataPagamento)}
                </Text>

                {item.observacao ? (
                  <Text style={styles.observacao} numberOfLines={2}>
                    {item.observacao}
                  </Text>
                ) : null}
              </View>

              <Text style={styles.seta}>›</Text>
            </Pressable>
          )}
        />
      </View>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  carregando: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
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

  alunoNome: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  descricao: {
    color: "#D0D0D0",
    fontSize: 15,
    marginBottom: 3,
  },

  tipoCobranca: {
    color: "#9E9E9E",
    fontSize: 13,
  },

  resumo: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  resumoItem: {
    flex: 1,
  },

  labelResumo: {
    color: "#9E9E9E",
    fontSize: 13,
    marginBottom: 5,
  },

  valorResumo: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  divisorResumo: {
    width: 1,
    height: 40,
    backgroundColor: "#3A3A3A",
    marginHorizontal: 20,
  },

  tituloLista: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  tituloSecao: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  quantidade: {
    color: "#9E9E9E",
    fontSize: 14,
    marginLeft: 8,
  },

  botaoNovo: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F44336",
    marginBottom: 14,
  },

  textoBotaoNovo: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },

  cardPagamento: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarPagamento: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarPagamentoTexto: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  infoPagamento: {
    flex: 1,
  },

  valorPagamento: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 3,
  },

  formaPagamento: {
    color: "#D0D0D0",
    fontSize: 14,
    marginBottom: 2,
  },

  dataPagamento: {
    color: "#9E9E9E",
    fontSize: 13,
  },

  observacao: {
    color: "#9E9E9E",
    fontSize: 13,
    marginTop: 5,
  },

  seta: {
    color: "#777777",
    fontSize: 30,
    marginLeft: 8,
  },

  vazio: {
    alignItems: "center",
    paddingVertical: 40,
  },

  vazioTitulo: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  vazioDescricao: {
    color: "#9E9E9E",
    fontSize: 14,
    textAlign: "center",
  },

  mensagem: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
