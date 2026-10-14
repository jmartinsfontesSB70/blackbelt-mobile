import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import {
  atualizarTipoCobranca,
  buscarTipoCobranca,
} from "@/services/tipoCobrancaService";

export default function EditarTipoCobrancaScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setMensagem("");
      setCarregando(true);

      const tipoCobranca = await buscarTipoCobranca(id);

      setNome(tipoCobranca.nome ?? "");
      setDescricao(tipoCobranca.descricao ?? "");
      setAtivo(tipoCobranca.ativo ?? true);

      if (tipoCobranca.valorUnitario != null) {
        setValorUnitario(
          Number(tipoCobranca.valorUnitario).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        );
      } else {
        setValorUnitario("");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar tipo de cobrança.");
      }
    } finally {
      setCarregando(false);
    }
  }

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

      await atualizarTipoCobranca(id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        valorUnitario: valor,
        ativo,
      });

      Alert.alert("Sucesso", "Tipo de cobrança atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/TiposCobranca"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o tipo de cobrança.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="TIPO_COBRANCA_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="TIPO_COBRANCA_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>
            Carregando tipo de cobrança...
          </Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="TIPO_COBRANCA_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar tipo de cobrança",
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
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Editar tipo de cobrança</Text>

              <Text style={styles.subtitulo}>
                Atualize os dados do tipo de cobrança
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>💰</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da cobrança</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações do tipo de cobrança
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
                maxLength={100}
              />

              <Text style={styles.label}>Descrição</Text>

              <TextInput
                style={[styles.input, styles.inputDescricao]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição do tipo de cobrança"
                placeholderTextColor="#777777"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={255}
              />

              <Text style={styles.label}>Valor unitário *</Text>

              <TextInput
                style={styles.input}
                value={valorUnitario}
                onChangeText={(texto) => setValorUnitario(formatarValor(texto))}
                placeholder="0,00"
                placeholderTextColor="#777777"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Situação</Text>

              <View style={styles.linhaStatus}>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitulo}>
                    {ativo ? "Ativo" : "Inativo"}
                  </Text>

                  <Text style={styles.statusDescricao}>
                    {ativo
                      ? "Este tipo de cobrança está disponível."
                      : "Este tipo de cobrança está desativado."}
                  </Text>
                </View>

                <Switch
                  value={ativo}
                  onValueChange={setAtivo}
                  trackColor={{
                    false: "#3A171A",
                    true: "#2A6B43",
                  }}
                  thumbColor={ativo ? "#75D89A" : "#F08A91"}
                />
              </View>
            </View>

            <Permissao permissao="TIPO_COBRANCA_EDITAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoTexto}>Salvar alterações</Text>
                )}
              </TouchableOpacity>
            </Permissao>

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
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#242424",
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

  inputDescricao: {
    height: 90,
    paddingTop: 13,
  },

  linhaStatus: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  statusInfo: {
    flex: 1,
    paddingRight: 12,
  },

  statusTitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  statusDescricao: {
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
