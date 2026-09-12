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

import { listarMatriculasParaSelecao } from "@/services/matriculaService";
import { criarPresenca } from "@/services/presencaService";

export default function NovaPresencaScreen() {
  const router = useRouter();

  const [matriculaId, setMatriculaId] = useState("");
  const [matriculaNome, setMatriculaNome] = useState("");

  const [data, setData] = useState("");
  const [presente, setPresente] = useState(true);
  const [observacao, setObservacao] = useState("");

  const [matriculas, setMatriculas] = useState<any[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setMensagem("");
      setCarregando(true);

      const matriculasResposta = await listarMatriculasParaSelecao();

      const opcoes = matriculasResposta.map((matricula: any) => ({
        id: matricula.id,
        nome: `${matricula.alunoNome} - ${matricula.turmaNome}`,
      }));

      setMatriculas(opcoes);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar matrículas.");
      }
    } finally {
      setCarregando(false);
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

  function converterDataParaApi(dataTexto: string) {
    const partes = dataTexto.split("/");

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

  async function salvar() {
    if (!matriculaId) {
      Alert.alert("Atenção", "Selecione a matrícula.");
      return;
    }

    if (!data.trim()) {
      Alert.alert("Atenção", "Informe a data da presença.");
      return;
    }

    if (data.length !== 10) {
      Alert.alert(
        "Atenção",
        "Informe a data da presença no formato DD/MM/AAAA.",
      );
      return;
    }

    const dataParaApi = converterDataParaApi(data);

    if (!dataParaApi) {
      Alert.alert("Atenção", "Informe uma data válida.");
      return;
    }

    if (observacao.length > 300) {
      Alert.alert("Atenção", "A observação deve ter no máximo 300 caracteres.");
      return;
    }

    try {
      setSalvando(true);

      await criarPresenca({
        matriculaId: Number(matriculaId),
        data: dataParaApi,
        presente,
        observacao: observacao.trim() || null,
      });

      Alert.alert("Sucesso", "Presença registrada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/presencas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível registrar a presença.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="PRESENCA_CRIAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="PRESENCA_CRIAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando matrículas...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="PRESENCA_CRIAR">
      <>
        <Stack.Screen
          options={{
            title: "Nova presença",
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
              <Text style={styles.titulo}>Nova presença</Text>

              <Text style={styles.subtitulo}>
                Registre a presença de um aluno
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>📋</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da presença</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações do registro
                  </Text>
                </View>
              </View>

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

              <Text style={styles.label}>Data da presença *</Text>

              <TextInput
                style={styles.input}
                value={data}
                onChangeText={(texto) => setData(formatarData(texto))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#777777"
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.label}>Presença *</Text>

              <View style={styles.linhaPresenca}>
                <TouchableOpacity
                  style={[
                    styles.botaoPresenca,
                    presente && styles.botaoPresente,
                  ]}
                  onPress={() => setPresente(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.botaoPresencaTexto,
                      presente && styles.botaoPresenteTexto,
                    ]}
                  >
                    Presente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoPresenca,
                    !presente && styles.botaoAusente,
                  ]}
                  onPress={() => setPresente(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.botaoPresencaTexto,
                      !presente && styles.botaoAusenteTexto,
                    ]}
                  >
                    Ausente
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Observação</Text>

              <TextInput
                style={[styles.input, styles.inputObservacao]}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Observação opcional"
                placeholderTextColor="#777777"
                multiline
                maxLength={300}
                textAlignVertical="top"
              />

              <Text style={styles.contador}>{observacao.length}/300</Text>
            </View>

            <Permissao permissao="PRESENCA_CRIAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoTexto}>Registrar presença</Text>
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
    paddingBottom: 13,
  },

  contador: {
    textAlign: "right",
    fontSize: 11,
    color: "#777777",
    marginTop: 4,
  },

  linhaPresenca: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  botaoPresenca: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D0D0D",
  },

  botaoPresente: {
    backgroundColor: "#12351F",
    borderColor: "#2A6B43",
  },

  botaoAusente: {
    backgroundColor: "#3A171A",
    borderColor: "#5A2529",
  },

  botaoPresencaTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888888",
  },

  botaoPresenteTexto: {
    color: "#75D89A",
  },

  botaoAusenteTexto: {
    color: "#F08A91",
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
