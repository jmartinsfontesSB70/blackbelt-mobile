import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import { registrarPagamento } from "@/services/cobrancaService";

const formasPagamento = [
  {
    valor: "DINHEIRO",
    nome: "Dinheiro",
  },
  {
    valor: "PIX",
    nome: "PIX",
  },
  {
    valor: "CARTAO_CREDITO",
    nome: "Cartão de crédito",
  },
  {
    valor: "CARTAO_DEBITO",
    nome: "Cartão de débito",
  },
  {
    valor: "TRANSFERENCIA",
    nome: "Transferência",
  },
];

export default function NovoPagamentoScreen() {
  const { cobrancaId } = useLocalSearchParams<{
    cobrancaId: string;
  }>();

  const router = useRouter();

  const [dataPagamento, setDataPagamento] = useState("");
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  function formatarData(data: string) {
    const somenteNumeros = data.replace(/\D/g, "").substring(0, 8);

    if (somenteNumeros.length <= 2) {
      return somenteNumeros;
    }

    if (somenteNumeros.length <= 4) {
      return `${somenteNumeros.substring(0, 2)}/${somenteNumeros.substring(2)}`;
    }

    return `${somenteNumeros.substring(0, 2)}/${somenteNumeros.substring(
      2,
      4,
    )}/${somenteNumeros.substring(4)}`;
  }

  function formatarDataParaApi(data: string) {
    const somenteNumeros = data.replace(/\D/g, "");

    if (somenteNumeros.length !== 8) {
      return "";
    }

    const dia = somenteNumeros.substring(0, 2);
    const mes = somenteNumeros.substring(2, 4);
    const ano = somenteNumeros.substring(4, 8);

    return `${ano}-${mes}-${dia}`;
  }

  function formatarValor(valorDigitado: string) {
    const somenteNumeros = valorDigitado.replace(/\D/g, "");

    if (!somenteNumeros) {
      return "";
    }

    const numero = Number(somenteNumeros) / 100;

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function valorParaApi(valorFormatado: string) {
    const somenteNumeros = valorFormatado.replace(/\D/g, "");

    if (!somenteNumeros) {
      return 0;
    }

    return Number(somenteNumeros) / 100;
  }

  async function salvar() {
    if (!cobrancaId) {
      Alert.alert("Erro", "Cobrança não informada.");
      return;
    }

    if (!dataPagamento.trim()) {
      Alert.alert("Atenção", "Informe a data do pagamento.");
      return;
    }

    if (dataPagamento.replace(/\D/g, "").length !== 8) {
      Alert.alert("Atenção", "Informe uma data válida.");
      return;
    }

    if (!valor.trim()) {
      Alert.alert("Atenção", "Informe o valor do pagamento.");
      return;
    }

    if (!formaPagamento) {
      Alert.alert("Atenção", "Selecione a forma de pagamento.");
      return;
    }

    const dataParaApi = formatarDataParaApi(dataPagamento);

    const valorNumerico = valorParaApi(valor);

    if (!dataParaApi) {
      Alert.alert("Atenção", "Informe uma data válida.");
      return;
    }

    if (valorNumerico <= 0) {
      Alert.alert("Atenção", "O valor do pagamento deve ser maior que zero.");
      return;
    }

    try {
      setSalvando(true);

      await registrarPagamento(cobrancaId, {
        dataPagamento: dataParaApi,
        valor: valorNumerico,
        formaPagamento,
        observacao: observacao.trim(),
      });

      Alert.alert("Sucesso", "Pagamento registrado com sucesso.", [
        {
          text: "OK",
          onPress: () => router.dismissTo(`/cobranca/pagamentos/${cobrancaId}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message ?? "Não foi possível registrar o pagamento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Permissao permissao="PAGAMENTO_CADASTRAR">
      <Stack.Screen
        options={{
          title: "Novo pagamento",
          headerBackTitle: "Voltar",
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Novo pagamento</Text>

            <Text style={styles.descricao}>
              Registre um pagamento para esta cobrança.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Data do pagamento</Text>

            <TextInput
              style={styles.input}
              value={dataPagamento}
              onChangeText={(texto) => setDataPagamento(formatarData(texto))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#777777"
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Valor</Text>

            <TextInput
              style={styles.input}
              value={valor}
              onChangeText={(texto) => setValor(formatarValor(texto))}
              placeholder="0,00"
              placeholderTextColor="#777777"
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Forma de pagamento</Text>

            <View style={styles.formasPagamento}>
              {formasPagamento.map((forma) => {
                const selecionada = formaPagamento === forma.valor;

                return (
                  <Pressable
                    key={forma.valor}
                    style={[
                      styles.opcaoForma,
                      selecionada && styles.opcaoFormaSelecionada,
                    ]}
                    onPress={() => setFormaPagamento(forma.valor)}
                  >
                    <Text
                      style={[
                        styles.textoForma,
                        selecionada && styles.textoFormaSelecionada,
                      ]}
                    >
                      {forma.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Observação</Text>

            <TextInput
              style={[styles.input, styles.inputObservacao]}
              value={observacao}
              onChangeText={setObservacao}
              placeholder="Observação (opcional)"
              placeholderTextColor="#777777"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
            onPress={salvar}
            disabled={salvando}
          >
            <Text style={styles.textoBotaoSalvar}>
              {salvando ? "Salvando..." : "Registrar pagamento"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Permissao>
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

  cabecalho: {
    marginBottom: 20,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },

  descricao: {
    color: "#9E9E9E",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18,
  },

  inputObservacao: {
    minHeight: 100,
  },

  formasPagamento: {
    marginBottom: 10,
  },

  opcaoForma: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  opcaoFormaSelecionada: {
    borderColor: "#F44336",
  },

  textoForma: {
    color: "#D0D0D0",
    fontSize: 15,
  },

  textoFormaSelecionada: {
    color: "#F44336",
    fontWeight: "bold",
  },

  botaoSalvar: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F44336",
    marginTop: 20,
    marginBottom: 20,
  },

  textoBotaoSalvar: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },
});
