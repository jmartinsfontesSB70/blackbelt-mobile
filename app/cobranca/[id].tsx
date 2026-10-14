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
  buscarCobranca,
  cancelarCobranca,
  excluirCobranca,
} from "@/services/cobrancaService";

type Cobranca = {
  id: number;
  matriculaId: number;
  alunoId: number;
  alunoNome: string;
  tipoCobrancaId: number;
  tipoCobrancaNome: string;
  descricao: string;
  competencia?: string;
  dataVencimento: string;
  quantidade: number;
  valorUnitario: number;
  valor: number;
  status: string;
  dataCancelamento?: string;
  observacao?: string;
};

export default function CobrancaDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [cobranca, setCobranca] = useState<Cobranca | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function carregarCobranca() {
    try {
      setMensagem("");

      const dados = await buscarCobranca(id);

      setCobranca(dados);
    } catch (erro: any) {
      setMensagem(erro?.message || "Não foi possível carregar a cobrança.");
    }
  }

  useEffect(() => {
    carregarCobranca();
  }, [id]);

  function formatarData(data?: string) {
    if (!data) return "-";

    const [ano, mes, dia] = data.split("-");

    if (!ano || !mes || !dia) return data;

    return `${dia}/${mes}/${ano}`;
  }

  function formatarCompetencia(competencia?: string) {
    if (!competencia) return "-";

    const [ano, mes] = competencia.split("-");

    if (!ano || !mes) return competencia;

    return `${mes}/${ano}`;
  }

  function formatarMoeda(valor?: number) {
    if (valor == null) return "R$ 0,00";

    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function obterTextoStatus(status: string) {
    switch (status) {
      case "PAGO":
        return "Pago";

      case "PARCIAL":
        return "Parcial";

      case "CANCELADO":
        return "Cancelado";

      case "PENDENTE":
        return "Pendente";

      default:
        return status;
    }
  }

  function registrarPagamento() {
    router.push(`/cobranca/pagamentos/${id}`);
  }

  function confirmarCancelamento() {
    if (!cobranca) return;

    if (cobranca.status === "PAGO" || cobranca.status === "CANCELADO") {
      return;
    }

    Alert.alert(
      "Cancelar cobrança",
      "Tem certeza que deseja cancelar esta cobrança?",
      [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: executarCancelamento,
        },
      ],
    );
  }

  async function executarCancelamento() {
    if (!cobranca) return;

    try {
      setMensagem("");

      await cancelarCobranca(String(cobranca.id));

      await carregarCobranca();
    } catch (erro: any) {
      setMensagem(erro?.message || "Não foi possível cancelar a cobrança.");
    }
  }

  function confirmarExclusao() {
    if (!cobranca) return;

    Alert.alert(
      "Excluir cobrança",
      "Tem certeza que deseja excluir esta cobrança?",
      [
        {
          text: "Não",
          style: "cancel",
        },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: executarExclusao,
        },
      ],
    );
  }

  async function executarExclusao() {
    if (!cobranca) return;

    try {
      setExcluindo(true);
      setMensagem("");

      await excluirCobranca(String(cobranca.id));

      router.dismissTo("/cobrancas");
    } catch (erro: any) {
      setMensagem(erro?.message || "Não foi possível excluir a cobrança.");
    } finally {
      setExcluindo(false);
    }
  }

  if (!cobranca) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Detalhes da cobrança",
            headerBackTitle: "Voltar",
          }}
        />

        <View style={styles.carregando}>
          {mensagem ? (
            <Text style={styles.mensagem}>{mensagem}</Text>
          ) : (
            <ActivityIndicator size="large" />
          )}
        </View>
      </>
    );
  }

  const inicial = cobranca.alunoNome
    ? cobranca.alunoNome.charAt(0).toUpperCase()
    : "?";

  return (
    <RotaPermissao permissao="COBRANCA_LISTAR">
      <Stack.Screen
        options={{
          title: "Detalhes da cobrança",
          headerBackTitle: "Voltar",
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
      >
        <View style={styles.cabecalho}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{inicial}</Text>
          </View>

          <View style={styles.cabecalhoTexto}>
            <Text style={styles.titulo}>{cobranca.alunoNome}</Text>

            <Text style={styles.subtitulo}>{cobranca.tipoCobrancaNome}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Dados da cobrança</Text>

          <View style={styles.linha}>
            <Text style={styles.label}>Aluno</Text>

            <Text style={styles.valor}>{cobranca.alunoNome}</Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>Tipo de cobrança</Text>

            <Text style={styles.valor}>{cobranca.tipoCobrancaNome}</Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>Descrição</Text>

            <Text style={styles.valor}>{cobranca.descricao}</Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>Competência</Text>

            <Text style={styles.valor}>
              {formatarCompetencia(cobranca.competencia)}
            </Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>Vencimento</Text>

            <Text style={styles.valor}>
              {formatarData(cobranca.dataVencimento)}
            </Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>Quantidade</Text>

            <Text style={styles.valor}>{cobranca.quantidade}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Valores</Text>

          <View style={styles.linha}>
            <Text style={styles.label}>Valor unitário</Text>

            <Text style={styles.valor}>
              {formatarMoeda(cobranca.valorUnitario)}
            </Text>
          </View>

          <View style={styles.linha}>
            <Text style={styles.label}>Valor total</Text>

            <Text style={styles.valorDestaque}>
              {formatarMoeda(cobranca.valor)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Situação</Text>

          <View style={styles.status}>
            <Text style={styles.statusTexto}>
              {obterTextoStatus(cobranca.status)}
            </Text>
          </View>

          {cobranca.dataCancelamento ? (
            <View style={styles.linhaCancelamento}>
              <Text style={styles.label}>Data do cancelamento</Text>

              <Text style={styles.valor}>
                {formatarData(cobranca.dataCancelamento)}
              </Text>
            </View>
          ) : null}

          {cobranca.observacao ? (
            <View style={styles.linhaObservacao}>
              <Text style={styles.label}>Observação</Text>

              <Text style={styles.valor}>{cobranca.observacao}</Text>
            </View>
          ) : null}
        </View>

        {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}

        <View style={styles.acoes}>
          <Permissao permissao="PAGAMENTO_CADASTRAR" esconder>
            {cobranca.status !== "CANCELADO" && cobranca.status !== "PAGO" ? (
              <Pressable
                style={styles.botaoNeutro}
                onPress={registrarPagamento}
              >
                <Text style={styles.textoBotaoVermelho}>
                  Registrar pagamento
                </Text>
              </Pressable>
            ) : null}
          </Permissao>

          <Permissao permissao="COBRANCA_CANCELAR" esconder>
            {cobranca.status !== "PAGO" && cobranca.status !== "CANCELADO" ? (
              <Pressable
                style={styles.botaoNeutro}
                onPress={confirmarCancelamento}
                disabled={excluindo}
              >
                <Text style={styles.textoBotaoVermelho}>Cancelar cobrança</Text>
              </Pressable>
            ) : null}
          </Permissao>

          <Permissao permissao="COBRANCA_EXCLUIR" esconder>
            <Pressable
              style={styles.botaoExcluir}
              onPress={confirmarExclusao}
              disabled={excluindo}
            >
              <Text style={styles.textoBotaoExcluir}>
                {excluindo ? "Excluindo..." : "Excluir cobrança"}
              </Text>
            </Pressable>
          </Permissao>
        </View>
      </ScrollView>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  conteudo: {
    padding: 16,
    paddingBottom: 100,
  },

  carregando: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarTexto: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  cabecalhoTexto: {
    flex: 1,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#AAAAAA",
    fontSize: 15,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  cardTitulo: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },

  linha: {
    marginBottom: 12,
  },

  label: {
    color: "#888888",
    fontSize: 13,
    marginBottom: 3,
  },

  valor: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  valorDestaque: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  status: {
    alignSelf: "flex-start",
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },

  statusTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  linhaCancelamento: {
    marginTop: 16,
  },

  linhaObservacao: {
    marginTop: 8,
  },

  mensagem: {
    color: "#AAAAAA",
    textAlign: "center",
    marginVertical: 12,
    fontSize: 14,
  },

  acoes: {
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },

  botaoNeutro: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },

  textoBotaoVermelho: {
    color: "#F44336",
    fontSize: 15,
    fontWeight: "bold",
  },

  botaoExcluir: {
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  textoBotaoExcluir: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
