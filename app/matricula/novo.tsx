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

import { listarAlunosParaSelecao } from "@/services/alunoService";
import { criarMatricula } from "@/services/matriculaService";
import { listarTurmasParaSelecao } from "@/services/turmaService";

export default function NovaMatriculaScreen() {
  const router = useRouter();

  const [alunoId, setAlunoId] = useState("");
  const [alunoNome, setAlunoNome] = useState("");

  const [turmaId, setTurmaId] = useState("");
  const [turmaNome, setTurmaNome] = useState("");

  const [dataMatricula, setDataMatricula] = useState("");

  const [ativa, setAtiva] = useState(true);

  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarOpcoes();
  }, []);

  async function carregarOpcoes() {
    try {
      setCarregandoOpcoes(true);

      const [alunosResposta, turmasResposta] = await Promise.all([
        listarAlunosParaSelecao(),
        listarTurmasParaSelecao(),
      ]);

      setAlunos(alunosResposta);
      setTurmas(turmasResposta);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível carregar alunos e turmas.");
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

      await criarMatricula({
        alunoId: Number(alunoId),
        turmaId: Number(turmaId),
        dataMatricula: dataParaApi,
        ativa,
      });

      Alert.alert("Sucesso", "Matrícula cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/matriculas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar a matrícula.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="MATRICULA_CRIAR">
      <>
        <Stack.Screen
          options={{
            title: "Nova matrícula",
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
              <Text style={styles.titulo}>Nova matrícula</Text>

              <Text style={styles.subtitulo}>
                Cadastre uma nova matrícula no BlackBelt
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
                    Informações da nova matrícula
                  </Text>
                </View>
              </View>

              {carregandoOpcoes ? (
                <View style={styles.carregandoOpcoes}>
                  <ActivityIndicator color="#C1121F" />

                  <Text style={styles.carregandoOpcoesTexto}>
                    Carregando alunos e turmas...
                  </Text>
                </View>
              ) : (
                <>
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
                </>
              )}

              <Text style={styles.label}>Data da matrícula *</Text>

              <TextInput
                style={styles.input}
                value={dataMatricula}
                onChangeText={(texto) => setDataMatricula(formatarData(texto))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#777777"
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

            <Permissao permissao="MATRICULA_CRIAR" esconder>
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
                  <Text style={styles.botaoTexto}>Cadastrar matrícula</Text>
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
    borderColor: "#2B2B2B",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D0D0D",
  },

  botaoStatusAtivo: {
    backgroundColor: "#12351F",
    borderColor: "#2A6B43",
  },

  botaoStatusInativo: {
    backgroundColor: "#3A171A",
    borderColor: "#5A2529",
  },

  botaoStatusTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888888",
  },

  botaoStatusTextoAtivo: {
    color: "#75D89A",
  },

  botaoStatusTextoInativo: {
    color: "#F08A91",
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
