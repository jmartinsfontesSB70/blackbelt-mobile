import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";
import SelectInput from "@/components/SelectInput";

import { criarCobranca } from "@/services/cobrancaService";
import { listarMatriculasParaSelecao } from "@/services/matriculaService";
import { listarTiposCobranca } from "@/services/tipoCobrancaService";

export default function NovaCobrancaScreen() {
  const router = useRouter();

  const [matriculaId, setMatriculaId] = useState("");
  const [matriculaNome, setMatriculaNome] = useState("");

  const [tipoCobrancaId, setTipoCobrancaId] = useState("");
  const [tipoCobrancaNome, setTipoCobrancaNome] = useState("");

  const [descricao, setDescricao] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [observacao, setObservacao] = useState("");

  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [tiposCobranca, setTiposCobranca] = useState<any[]>([]);

  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarOpcoes();
  }, []);

  async function carregarOpcoes() {
    try {
      setCarregandoOpcoes(true);

      const [matriculasResposta, tiposResposta] = await Promise.all([
        listarMatriculasParaSelecao(),
        listarTiposCobranca(),
      ]);

      const matriculasFormatadas = matriculasResposta.map((matricula: any) => ({
        id: matricula.id,
        nome: `${matricula.alunoNome} - ${matricula.turmaNome}`,
      }));

      const tiposAtivos = tiposResposta.filter((tipo: any) => tipo.ativo);

      setMatriculas(matriculasFormatadas);
      setTiposCobranca(tiposAtivos);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível carregar matrículas e tipos de cobrança.",
        );
      }
    } finally {
      setCarregandoOpcoes(false);
    }
  }

  function formatarData(texto: string) {
    const somenteNumeros = texto.replace(/\D/g, "").slice(0, 8);

    if (somenteNumeros.length <= 2) {
      return somenteNumeros;
    }

    if (somenteNumeros.length <= 4) {
      return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
    }

    return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(
      2,
      4,
    )}/${somenteNumeros.slice(4)}`;
  }

  function converterDataParaApi(data: string) {
    const partes = data.split("/");

    if (partes.length !== 3) {
      return null;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(ano)
    ) {
      return null;
    }

    if (dia < 1 || dia > 31) {
      return null;
    }

    if (mes < 1 || mes > 12) {
      return null;
    }

    if (ano < 1900 || ano > 2100) {
      return null;
    }

    return `${ano.toString().padStart(4, "0")}-${mes
      .toString()
      .padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
  }

  function formatarCompetencia(texto: string) {
    const somenteNumeros = texto.replace(/\D/g, "").slice(0, 6);

    if (somenteNumeros.length <= 2) {
      return somenteNumeros;
    }

    return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
  }

  function converterCompetenciaParaApi(valor: string) {
    if (!valor.trim()) {
      return null;
    }

    const partes = valor.split("/");

    if (partes.length !== 2) {
      return null;
    }

    const mes = Number(partes[0]);
    const ano = Number(partes[1]);

    if (
      !Number.isInteger(mes) ||
      !Number.isInteger(ano) ||
      mes < 1 ||
      mes > 12 ||
      ano < 1900 ||
      ano > 2100
    ) {
      return null;
    }

    return `${ano.toString().padStart(4, "0")}-${mes
      .toString()
      .padStart(2, "0")}`;
  }

  async function salvar() {
    if (!matriculaId) {
      Alert.alert("Atenção", "Selecione a matrícula.");
      return;
    }

    if (!tipoCobrancaId) {
      Alert.alert("Atenção", "Selecione o tipo de cobrança.");
      return;
    }

    if (!descricao.trim()) {
      Alert.alert("Atenção", "Informe a descrição.");
      return;
    }

    let competenciaParaApi = null;

    if (competencia.trim()) {
      if (competencia.length !== 7) {
        Alert.alert("Atenção", "Informe a competência no formato MM/AAAA.");
        return;
      }

      competenciaParaApi = converterCompetenciaParaApi(competencia);

      if (!competenciaParaApi) {
        Alert.alert("Atenção", "Informe uma competência válida.");
        return;
      }
    }

    if (!dataVencimento.trim()) {
      Alert.alert("Atenção", "Informe a data de vencimento.");
      return;
    }

    if (dataVencimento.length !== 10) {
      Alert.alert("Atenção", "Informe o vencimento no formato DD/MM/AAAA.");
      return;
    }

    const dataVencimentoParaApi = converterDataParaApi(dataVencimento);

    if (!dataVencimentoParaApi) {
      Alert.alert("Atenção", "Informe uma data de vencimento válida.");
      return;
    }

    const quantidadeNumerica = Number(quantidade);

    if (!Number.isInteger(quantidadeNumerica) || quantidadeNumerica < 1) {
      Alert.alert("Atenção", "A quantidade deve ser maior que zero.");
      return;
    }

    try {
      setSalvando(true);

      await criarCobranca({
        matriculaId: Number(matriculaId),
        tipoCobrancaId: Number(tipoCobrancaId),
        descricao: descricao.trim(),
        competencia: competenciaParaApi,
        dataVencimento: dataVencimentoParaApi,
        quantidade: quantidadeNumerica,
        observacao: observacao.trim(),
      });

      Alert.alert("Sucesso", "Cobrança cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/cobrancas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar a cobrança.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="COBRANCA_CADASTRAR">
      <>
        <Stack.Screen
          options={{
            title: "Nova cobrança",
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
              <Text style={styles.titulo}>Nova cobrança</Text>

              <Text style={styles.subtitulo}>
                Cadastre uma nova cobrança no BlackBelt
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
                    Informações da nova cobrança
                  </Text>
                </View>
              </View>

              {carregandoOpcoes ? (
                <View style={styles.carregandoOpcoes}>
                  <ActivityIndicator color="#C1121F" />

                  <Text style={styles.carregandoOpcoesTexto}>
                    Carregando opções...
                  </Text>
                </View>
              ) : (
                <>
                  <SelectInput
                    label="Matrícula *"
                    value={matriculaNome}
                    placeholder="Selecione a matrícula"
                    options={matriculas}
                    selectedId={matriculaId}
                    onSelect={(item) => {
                      setMatriculaId(String(item.id));
                      setMatriculaNome(item.nome);
                    }}
                  />

                  <SelectInput
                    label="Tipo de cobrança *"
                    value={tipoCobrancaNome}
                    placeholder="Selecione o tipo de cobrança"
                    options={tiposCobranca}
                    selectedId={tipoCobrancaId}
                    onSelect={(item) => {
                      setTipoCobrancaId(String(item.id));
                      setTipoCobrancaNome(item.nome);
                    }}
                  />
                </>
              )}

              <Text style={styles.label}>Descrição *</Text>

              <TextInput
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Ex.: Mensalidade setembro"
                placeholderTextColor="#777777"
              />

              <Text style={styles.label}>Competência</Text>

              <TextInput
                style={styles.input}
                value={competencia}
                onChangeText={(texto) =>
                  setCompetencia(formatarCompetencia(texto))
                }
                placeholder="MM/AAAA"
                placeholderTextColor="#777777"
                keyboardType="numeric"
                maxLength={7}
              />

              <Text style={styles.label}>Data de vencimento *</Text>

              <TextInput
                style={styles.input}
                value={dataVencimento}
                onChangeText={(texto) => setDataVencimento(formatarData(texto))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#777777"
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.label}>Quantidade *</Text>

              <TextInput
                style={styles.input}
                value={quantidade}
                onChangeText={(texto) =>
                  setQuantidade(texto.replace(/\D/g, ""))
                }
                placeholder="1"
                placeholderTextColor="#777777"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Observação</Text>

              <TextInput
                style={[styles.input, styles.inputObservacao]}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Observações sobre a cobrança"
                placeholderTextColor="#777777"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Permissao permissao="COBRANCA_CADASTRAR" esconder>
              <TouchableOpacity
                style={[
                  styles.botao,
                  (salvando || carregandoOpcoes) && styles.botaoDesabilitado,
                ]}
                onPress={salvar}
                disabled={salvando || carregandoOpcoes}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoTexto}>Cadastrar cobrança</Text>
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

  inputObservacao: {
    height: 100,
    paddingTop: 13,
  },

  carregandoOpcoes: {
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  carregandoOpcoesTexto: {
    marginTop: 8,
    color: "#888888",
    fontSize: 13,
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
