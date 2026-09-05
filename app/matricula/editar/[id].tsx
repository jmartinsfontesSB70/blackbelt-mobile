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

import { listarAlunosParaSelecao } from "@/services/alunoService";
import {
  atualizarMatricula,
  buscarMatricula,
} from "@/services/matriculaService";
import { listarTurmasParaSelecao } from "@/services/turmaService";

export default function EditarMatriculaScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [alunoId, setAlunoId] = useState("");
  const [alunoNome, setAlunoNome] = useState("");

  const [turmaId, setTurmaId] = useState("");
  const [turmaNome, setTurmaNome] = useState("");

  const [dataMatricula, setDataMatricula] = useState("");

  const [ativa, setAtiva] = useState(true);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

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

      const [matricula, alunosResposta, turmasResposta] = await Promise.all([
        buscarMatricula(id),
        listarAlunosParaSelecao(),
        listarTurmasParaSelecao(),
      ]);

      setAlunoId(matricula.alunoId != null ? String(matricula.alunoId) : "");

      setTurmaId(matricula.turmaId != null ? String(matricula.turmaId) : "");

      const alunoSelecionado = alunosResposta.find(
        (aluno: any) => String(aluno.id) === String(matricula.alunoId),
      );

      const turmaSelecionada = turmasResposta.find(
        (turma: any) => String(turma.id) === String(matricula.turmaId),
      );

      setAlunoNome(alunoSelecionado?.nome ?? "");
      setTurmaNome(turmaSelecionada?.nome ?? "");

      if (matricula.dataMatricula) {
        const partes = matricula.dataMatricula.split("-");

        if (partes.length === 3) {
          setDataMatricula(`${partes[2]}/${partes[1]}/${partes[0]}`);
        } else {
          setDataMatricula("");
        }
      } else {
        setDataMatricula("");
      }

      setAtiva(matricula.ativa ?? true);

      setAlunos(alunosResposta);
      setTurmas(turmasResposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar matrícula.");
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

  async function salvar() {
    if (!alunoId) {
      Alert.alert("Atenção", "Selecione o aluno.");
      return;
    }

    if (!turmaId) {
      Alert.alert("Atenção", "Selecione a turma.");
      return;
    }

    if (!dataMatricula.trim()) {
      Alert.alert("Atenção", "Informe a data da matrícula.");
      return;
    }

    if (dataMatricula.length !== 10) {
      Alert.alert(
        "Atenção",
        "Informe a data da matrícula no formato DD/MM/AAAA.",
      );
      return;
    }

    const dataParaApi = converterDataParaApi(dataMatricula);

    if (!dataParaApi) {
      Alert.alert("Atenção", "Informe uma data válida.");
      return;
    }

    try {
      setSalvando(true);

      await atualizarMatricula(id, {
        alunoId: Number(alunoId),
        turmaId: Number(turmaId),
        dataMatricula: dataParaApi,
        ativa,
      });

      Alert.alert("Sucesso", "Matrícula atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/matriculas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a matrícula.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="MATRICULA_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="MATRICULA_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando matrícula...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MATRICULA_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar matrícula",
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
              <Text style={styles.titulo}>Editar matrícula</Text>

              <Text style={styles.subtitulo}>
                Atualize os dados da matrícula
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🥋</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da matrícula</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações da matrícula
                  </Text>
                </View>
              </View>

              <SelectInput
                label="Aluno *"
                value={alunoNome}
                placeholder="Selecione o aluno"
                options={alunos}
                selectedId={alunoId}
                onSelect={(item) => {
                  setAlunoId(String(item.id));
                  setAlunoNome(item.nome);
                }}
              />

              <SelectInput
                label="Turma *"
                value={turmaNome}
                placeholder="Selecione a turma"
                options={turmas}
                selectedId={turmaId}
                onSelect={(item) => {
                  setTurmaId(String(item.id));
                  setTurmaNome(item.nome);
                }}
              />

              <Text style={styles.label}>Data da matrícula *</Text>

              <TextInput
                style={styles.input}
                value={dataMatricula}
                onChangeText={(texto) => setDataMatricula(formatarData(texto))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.label}>Situação</Text>

              <View style={styles.linhaStatus}>
                <TouchableOpacity
                  style={[styles.botaoStatus, ativa && styles.botaoStatusAtivo]}
                  onPress={() => setAtiva(true)}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      ativa && styles.botaoStatusTextoAtivo,
                    ]}
                  >
                    Ativa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoStatus,
                    !ativa && styles.botaoStatusInativo,
                  ]}
                  onPress={() => setAtiva(false)}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      !ativa && styles.botaoStatusTextoInativo,
                    ]}
                  >
                    Inativa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Permissao permissao="MATRICULA_EDITAR" esconder>
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

  linhaStatus: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  botaoStatus: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },

  botaoStatusAtivo: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },

  botaoStatusInativo: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },

  botaoStatusTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  botaoStatusTextoAtivo: {
    color: "#166534",
  },

  botaoStatusTextoInativo: {
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
