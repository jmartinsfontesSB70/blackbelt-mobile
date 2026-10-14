import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { criarTipoCobranca } from "@/services/tipoCobrancaService";

export default function NovoTipoCobrancaScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [salvando, setSalvando] = useState(false);

  function formatarValor(texto: string) {
    const somenteNumeros = texto.replace(/\D/g, "");

    if (!somenteNumeros) {
      return "";
    }

    const valor = Number(somenteNumeros) / 100;

    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function obterValorNumerico(valor: string): number {
    const valorSemFormatacao = valor.replace(/\./g, "").replace(",", ".");

    return Number(valorSemFormatacao);
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do tipo de cobrança.");
      return;
    }

    if (!valorUnitario.trim()) {
      Alert.alert("Atenção", "Informe o valor unitário.");
      return;
    }

    const valor = obterValorNumerico(valorUnitario);

    if (!Number.isFinite(valor) || valor < 0) {
      Alert.alert("Atenção", "Informe um valor unitário válido.");
      return;
    }

    try {
      setSalvando(true);

      await criarTipoCobranca({
        nome: nome.trim(),
        descricao: descricao.trim(),
        valorUnitario: valor,
        ativo,
      });

      Alert.alert("Sucesso", "Tipo de cobrança cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/TiposCobranca"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar o tipo de cobrança.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="TIPO_COBRANCA_CADASTRAR">
      <>
        <Stack.Screen
          options={{
            title: "Novo tipo de cobrança",
          }}
        />

        <KeyboardAvoidingView
          style={styles.tela}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Cabeçalho */}

            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Novo tipo de cobrança</Text>

              <Text style={styles.subtitulo}>
                Cadastre um tipo de cobrança para sua academia
              </Text>
            </View>

            {/* Dados */}

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>💰</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da cobrança</Text>

                  <Text style={styles.descricaoSecao}>
                    Defina as informações do tipo de cobrança
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome *</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Mensalidade"
                placeholderTextColor="#777777"
                autoCapitalize="words"
                editable={!salvando}
              />

              <Text style={styles.label}>Descrição</Text>

              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descreva o tipo de cobrança..."
                placeholderTextColor="#777777"
                multiline
                editable={!salvando}
              />

              <Text style={styles.label}>Valor unitário *</Text>

              <TextInput
                style={styles.input}
                value={valorUnitario}
                onChangeText={(texto) => setValorUnitario(formatarValor(texto))}
                placeholder="0,00"
                placeholderTextColor="#777777"
                keyboardType="numeric"
                editable={!salvando}
              />

              {/* Situação */}

              <View style={styles.situacaoContainer}>
                <View style={styles.situacaoTexto}>
                  <Text style={styles.labelSituacao}>Situação</Text>

                  <Text style={styles.descricaoSituacao}>
                    {ativo
                      ? "Tipo de cobrança ativo"
                      : "Tipo de cobrança inativo"}
                  </Text>
                </View>

                <Switch
                  value={ativo}
                  onValueChange={setAtivo}
                  disabled={salvando}
                  trackColor={{
                    false: "#333333",
                    true: "#7A1018",
                  }}
                  thumbColor={ativo ? "#C1121F" : "#888888"}
                />
              </View>
            </View>

            {/* Cadastrar */}

            <Permissao permissao="TIPO_COBRANCA_CADASTRAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoTexto}>
                    Cadastrar tipo de cobrança
                  </Text>
                )}
              </TouchableOpacity>
            </Permissao>

            {/* Cancelar */}

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => router.back()}
              disabled={salvando}
              activeOpacity={0.7}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
    marginBottom: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  subtitulo: {
    fontSize: 14,
    color: "#888888",
    marginTop: 5,
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

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CCCCCC",
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    height: 48,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 15,
    color: "#FFFFFF",
  },

  inputMultiline: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  situacaoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#2B2B2B",
  },

  situacaoTexto: {
    flex: 1,
  },

  labelSituacao: {
    fontSize: 15,
    fontWeight: "600",
    color: "#CCCCCC",
  },

  descricaoSituacao: {
    fontSize: 12,
    color: "#777777",
    marginTop: 3,
  },

  botao: {
    height: 52,
    backgroundColor: "#C1121F",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoCancelar: {
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginTop: 4,
  },

  botaoCancelarTexto: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "600",
  },
});
