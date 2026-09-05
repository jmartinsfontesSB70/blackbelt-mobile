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

import { listarModalidadesParaSelecao } from "@/services/modalidadeService";
import { listarProfessoresParaSelecao } from "@/services/professorService";
import { atualizarTurma, buscarTurma } from "@/services/turmaService";

export default function EditarTurmaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

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

      const [turma, professoresResposta, modalidadesResposta] =
        await Promise.all([
          buscarTurma(id),
          listarProfessoresParaSelecao(),
          listarModalidadesParaSelecao(),
        ]);

      setNome(turma.nome ?? "");

      setProfessorId(
        turma.professorId != null ? String(turma.professorId) : "",
      );

      setModalidadeId(
        turma.modalidadeId != null ? String(turma.modalidadeId) : "",
      );

      const professorSelecionado = professoresResposta.find(
        (professor: any) => String(professor.id) === String(turma.professorId),
      );

      const modalidadeSelecionada = modalidadesResposta.find(
        (modalidade: any) =>
          String(modalidade.id) === String(turma.modalidadeId),
      );

      setProfessorNome(professorSelecionado?.nome ?? "");
      setModalidadeNome(modalidadeSelecionada?.nome ?? "");

      setDiasSemana(turma.diasSemana ?? "");

      setHorarioInicio(
        turma.horarioInicio ? turma.horarioInicio.substring(0, 5) : "",
      );

      setHorarioFim(turma.horarioFim ? turma.horarioFim.substring(0, 5) : "");

      setCapacidade(turma.capacidade != null ? String(turma.capacidade) : "");

      setAtiva(turma.ativa ?? true);

      setProfessores(professoresResposta);
      setModalidades(modalidadesResposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar turma.");
      }
    } finally {
      setCarregando(false);
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

    if (horarioFim <= horarioInicio) {
      Alert.alert(
        "Atenção",
        "O horário final deve ser posterior ao horário inicial.",
      );
      return;
    }

    if (!capacidade.trim()) {
      Alert.alert("Atenção", "Informe a capacidade da turma.");
      return;
    }

    const capacidadeNumerica = Number(capacidade);

    if (!Number.isInteger(capacidadeNumerica) || capacidadeNumerica <= 0) {
      Alert.alert(
        "Atenção",
        "A capacidade deve ser um número inteiro maior que zero.",
      );
      return;
    }

    try {
      setSalvando(true);

      await atualizarTurma(id, {
        nome: nome.trim(),
        modalidadeId: Number(modalidadeId),
        professorId: Number(professorId),
        diasSemana: diasSemana.trim(),
        horarioInicio,
        horarioFim,
        capacidade: capacidadeNumerica,
        ativa,
      });

      Alert.alert("Sucesso", "Turma atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/turmas"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a turma.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="TURMA_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="TURMA_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando turma...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="TURMA_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar turma",
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
              <Text style={styles.titulo}>Editar turma</Text>

              <Text style={styles.subtitulo}>Atualize os dados da turma</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🥋</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da turma</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações da turma
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome da turma *</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Jiu-Jitsu Adulto"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />

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

              <Text style={styles.label}>Dias da semana *</Text>

              <TextInput
                style={styles.input}
                value={diasSemana}
                onChangeText={setDiasSemana}
                placeholder="Ex.: SEG, QUA e SEX"
                placeholderTextColor="#9ca3af"
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
                    placeholderTextColor="#9ca3af"
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
                    placeholderTextColor="#9ca3af"
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
                placeholderTextColor="#9ca3af"
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

            <Permissao permissao="TURMA_EDITAR" esconder>
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
