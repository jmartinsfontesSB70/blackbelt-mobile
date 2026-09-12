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

import { listarModalidadesParaSelecao } from "@/services/modalidadeService";
import { listarProfessoresParaSelecao } from "@/services/professorService";
import { criarTurma } from "@/services/turmaService";

export default function NovoTurmaScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");

  const [modalidadeId, setModalidadeId] = useState("");
  const [modalidadeNome, setModalidadeNome] = useState("");

  const [professorId, setProfessorId] = useState("");
  const [professorNome, setProfessorNome] = useState("");

  const [diasSemana, setDiasSemana] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [capacidade, setCapacidade] = useState("");

  const [ativa, setAtiva] = useState(true);

  const [professores, setProfessores] = useState<any[]>([]);
  const [modalidades, setModalidades] = useState<any[]>([]);

  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarOpcoes();
  }, []);

  async function carregarOpcoes() {
    try {
      setCarregandoOpcoes(true);

      const [professoresResposta, modalidadesResposta] = await Promise.all([
        listarProfessoresParaSelecao(),
        listarModalidadesParaSelecao(),
      ]);

      setProfessores(professoresResposta);
      setModalidades(modalidadesResposta);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível carregar professores e modalidades.",
        );
      }
    } finally {
      setCarregandoOpcoes(false);
    }
  }

  function formatarHorario(texto: string) {
    const somenteNumeros = texto.replace(/\D/g, "").slice(0, 4);

    if (somenteNumeros.length <= 2) {
      return somenteNumeros;
    }

    return `${somenteNumeros.slice(0, 2)}:${somenteNumeros.slice(2)}`;
  }

  function horarioValido(horario: string) {
    const match = horario.match(/^(\d{2}):(\d{2})$/);

    if (!match) {
      return false;
    }

    const hora = Number(match[1]);
    const minuto = Number(match[2]);

    return hora >= 0 && hora <= 23 && minuto >= 0 && minuto <= 59;
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da turma.");
      return;
    }

    if (!modalidadeId) {
      Alert.alert("Atenção", "Selecione a modalidade.");
      return;
    }

    if (!professorId) {
      Alert.alert("Atenção", "Selecione o professor.");
      return;
    }

    if (!diasSemana.trim()) {
      Alert.alert("Atenção", "Informe os dias da semana.");
      return;
    }

    if (!horarioInicio.trim()) {
      Alert.alert("Atenção", "Informe o horário inicial.");
      return;
    }

    if (!horarioValido(horarioInicio)) {
      Alert.alert(
        "Atenção",
        "Informe um horário inicial válido no formato HH:MM. Exemplo: 08:00.",
      );
      return;
    }

    if (!horarioFim.trim()) {
      Alert.alert("Atenção", "Informe o horário final.");
      return;
    }

    if (!horarioValido(horarioFim)) {
      Alert.alert(
        "Atenção",
        "Informe um horário final válido no formato HH:MM. Exemplo: 10:00.",
      );
      return;
    }

    const capacidadeNumerica = Number(capacidade);

    if (!capacidade.trim()) {
      Alert.alert("Atenção", "Informe a capacidade da turma.");
      return;
    }

    if (capacidadeNumerica <= 0) {
      Alert.alert("Atenção", "A capacidade deve ser maior que zero.");
      return;
    }

    if (horarioFim <= horarioInicio) {
      Alert.alert(
        "Atenção",
        "O horário final deve ser posterior ao horário inicial.",
      );
      return;
    }

    try {
      setSalvando(true);

      await criarTurma({
        nome: nome.trim(),
        modalidadeId: Number(modalidadeId),
        professorId: Number(professorId),
        diasSemana: diasSemana.trim(),
        horarioInicio,
        horarioFim,
        capacidade: capacidadeNumerica,
        ativa,
      });

      Alert.alert("Sucesso", "Turma cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/turmas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar a turma.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="TURMA_CRIAR">
      <>
        <Stack.Screen
          options={{
            title: "Nova turma",
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
              <Text style={styles.titulo}>Nova turma</Text>

              <Text style={styles.subtitulo}>
                Cadastre uma nova turma no BlackBelt
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🥋</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da turma</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações da nova turma
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome da turma *</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Jiu-Jitsu Adulto"
                placeholderTextColor="#777777"
                autoCapitalize="words"
              />

              {carregandoOpcoes ? (
                <View style={styles.carregandoOpcoes}>
                  <ActivityIndicator color="#C1121F" />

                  <Text style={styles.carregandoOpcoesTexto}>
                    Carregando modalidades e professores...
                  </Text>
                </View>
              ) : (
                <>
                  <SelectInput
                    label="Modalidade *"
                    value={modalidadeNome}
                    placeholder="Selecione a modalidade"
                    options={modalidades}
                    selectedId={modalidadeId}
                    onSelect={(item) => {
                      setModalidadeId(String(item.id));
                      setModalidadeNome(item.nome);
                    }}
                  />

                  <SelectInput
                    label="Professor *"
                    value={professorNome}
                    placeholder="Selecione o professor"
                    options={professores}
                    selectedId={professorId}
                    onSelect={(item) => {
                      setProfessorId(String(item.id));
                      setProfessorNome(item.nome);
                    }}
                  />
                </>
              )}

              <Text style={styles.label}>Dias da semana *</Text>

              <TextInput
                style={styles.input}
                value={diasSemana}
                onChangeText={setDiasSemana}
                placeholder="Ex.: SEG, QUA e SEX"
                placeholderTextColor="#777777"
                autoCapitalize="characters"
              />

              <View style={styles.linha}>
                <View style={styles.campoMaior}>
                  <Text style={styles.label}>Horário inicial *</Text>

                  <TextInput
                    style={styles.input}
                    value={horarioInicio}
                    onChangeText={(texto) =>
                      setHorarioInicio(formatarHorario(texto))
                    }
                    placeholder="08:00"
                    placeholderTextColor="#777777"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={styles.campoMaior}>
                  <Text style={styles.label}>Horário final *</Text>

                  <TextInput
                    style={styles.input}
                    value={horarioFim}
                    onChangeText={(texto) =>
                      setHorarioFim(formatarHorario(texto))
                    }
                    placeholder="10:00"
                    placeholderTextColor="#777777"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <Text style={styles.label}>Capacidade *</Text>

              <TextInput
                style={styles.input}
                value={capacidade}
                onChangeText={setCapacidade}
                placeholder="Ex.: 30"
                placeholderTextColor="#777777"
                keyboardType="numeric"
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

            <Permissao permissao="TURMA_CRIAR" esconder>
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
                  <Text style={styles.botaoTexto}>Cadastrar turma</Text>
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

  linha: {
    flexDirection: "row",
    gap: 10,
  },

  campoMaior: {
    flex: 1,
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
