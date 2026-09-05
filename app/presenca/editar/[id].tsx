import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { atualizarPresenca, buscarPresenca } from "@/services/presencaService";

export default function EditarPresencaScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

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
  }, [id]);

  async function carregarDados() {
    try {
      setMensagem("");
      setCarregando(true);

      const [presenca, matriculasResposta] = await Promise.all([
        buscarPresenca(id),
        listarMatriculasParaSelecao(),
      ]);

      const opcoesMatriculas = matriculasResposta.map((matricula: any) => ({
        id: matricula.id,
        nome: `${matricula.alunoNome} - ${matricula.turmaNome}`,
      }));

      setMatriculas(opcoesMatriculas);

      setMatriculaId(
        presenca.matriculaId != null ? String(presenca.matriculaId) : "",
      );

      const matriculaSelecionada = opcoesMatriculas.find(
        (matricula: any) =>
          String(matricula.id) === String(presenca.matriculaId),
      );

      setMatriculaNome(matriculaSelecionada?.nome ?? "");

      if (presenca.data) {
        const partes = presenca.data.split("-");

        if (partes.length === 3) {
          setData(`${partes[2]}/${partes[1]}/${partes[0]}`);
        } else {
          setData("");
        }
      } else {
        setData("");
      }

      setPresente(presenca.presente ?? true);
      setObservacao(presenca.observacao ?? "");
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar presença.");
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

    try {
      setSalvando(true);

      await atualizarPresenca(id, {
        matriculaId: Number(matriculaId),
        data: dataParaApi,
        presente,
        observacao: observacao.trim() || null,
      });

      Alert.alert("Sucesso", "Presença atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/presencas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a presença.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="PRESENCA_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="PRESENCA_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando presença...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="PRESENCA_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar presença",
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
              <Text style={styles.titulo}>Editar presença</Text>

              <Text style={styles.subtitulo}>
                Atualize os dados do registro de presença
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🥋</Text>
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

              <Text style={styles.label}>Data *</Text>

              <TextInput
                style={styles.input}
                value={data}
                onChangeText={(texto) => setData(formatarData(texto))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.label}>Presença *</Text>

              <View style={styles.linhaPresenca}>
                <TouchableOpacity
                  style={[
                    styles.botaoPresenca,
                    presente && styles.botaoPresencaAtivo,
                  ]}
                  onPress={() => setPresente(true)}
                >
                  <Text
                    style={[
                      styles.botaoPresencaTexto,
                      presente && styles.botaoPresencaTextoAtivo,
                    ]}
                  >
                    Presente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoPresenca,
                    !presente && styles.botaoPresencaInativo,
                  ]}
                  onPress={() => setPresente(false)}
                >
                  <Text
                    style={[
                      styles.botaoPresencaTexto,
                      !presente && styles.botaoPresencaTextoInativo,
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
                placeholder="Informe uma observação, se necessário"
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={300}
                textAlignVertical="top"
              />

              <Text style={styles.contador}>{observacao.length}/300</Text>
            </View>

            <Permissao permissao="PRESENCA_EDITAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#ffffff" />
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
    backgroundColor: "#f5f6f8",
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
    color: "#111827",
  },

  subtitulo: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
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
    backgroundColor: "#f3f4f6",
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
    color: "#111827",
  },

  descricaoSecao: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    height: 48,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 15,
    color: "#111827",
  },

  inputObservacao: {
    height: 100,
    paddingTop: 13,
    paddingBottom: 13,
  },

  contador: {
    textAlign: "right",
    fontSize: 11,
    color: "#9ca3af",
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
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },

  botaoPresencaAtivo: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },

  botaoPresencaInativo: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },

  botaoPresencaTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  botaoPresencaTextoAtivo: {
    color: "#166534",
  },

  botaoPresencaTextoInativo: {
    color: "#991b1b",
  },

  botao: {
    height: 52,
    backgroundColor: "#111827",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: "#ffffff",
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
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "600",
  },

  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },

  carregandoTexto: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 15,
  },

  erroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f6f8",
  },

  erroTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },

  erro: {
    fontSize: 16,
    textAlign: "center",
    color: "#111827",
  },
});
