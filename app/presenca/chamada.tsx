import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";
import SelectInput from "@/components/SelectInput";
import { listarMatriculasAtivasPorTurma } from "@/services/matriculaService";
import {
  listarPresencasPorTurmaEData,
  registrarChamada,
} from "@/services/presencaService";
import { listarTurmasParaSelecao } from "@/services/turmaService";

function obterDataAtual() {
  const hoje = new Date();

  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const ano = hoje.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

function formatarData(data: string) {
  const somenteNumeros = data.replace(/\D/g, "").slice(0, 8);

  if (somenteNumeros.length <= 2) {
    return somenteNumeros;
  }

  if (somenteNumeros.length <= 4) {
    return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(2)}`;
  }

  return `${somenteNumeros.slice(0, 2)}/${somenteNumeros.slice(
    2,
    4,
  )}/${somenteNumeros.slice(4, 8)}`;
}

function converterDataParaApi(data: string) {
  const partes = data.split("/");

  if (partes.length !== 3) {
    return "";
  }

  const [dia, mes, ano] = partes;

  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
    return "";
  }

  return `${ano}-${mes}-${dia}`;
}

function dataValida(data: string) {
  const dataApi = converterDataParaApi(data);

  if (!dataApi) {
    return false;
  }

  const [ano, mes, dia] = dataApi.split("-").map(Number);

  const dataObjeto = new Date(ano, mes - 1, dia);

  return (
    dataObjeto.getFullYear() === ano &&
    dataObjeto.getMonth() === mes - 1 &&
    dataObjeto.getDate() === dia
  );
}

function dataEhFutura(data: string) {
  const dataApi = converterDataParaApi(data);

  if (!dataApi) {
    return false;
  }

  const [ano, mes, dia] = dataApi.split("-").map(Number);

  const dataSelecionada = new Date(ano, mes - 1, dia);

  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  return dataSelecionada > hoje;
}

export default function ChamadaScreen() {
  const router = useRouter();

  const [turmas, setTurmas] = useState<any[]>([]);
  const [turmaId, setTurmaId] = useState<number | string>("");

  const [data, setData] = useState(obterDataAtual());

  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [matriculasPresentes, setMatriculasPresentes] = useState<number[]>([]);

  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarTurmas();
  }, []);

  async function carregarTurmas() {
    try {
      setCarregandoTurmas(true);
      setErro("");

      const resposta = await listarTurmasParaSelecao();

      setTurmas(resposta ?? []);
    } catch (error: any) {
      console.error(error);

      setErro(error?.message || "Não foi possível carregar as turmas.");
    } finally {
      setCarregandoTurmas(false);
    }
  }

  async function carregarChamada(
    novaTurmaId: number | string = turmaId,
    novaData: string = data,
  ) {
    if (!novaTurmaId || !dataValida(novaData)) {
      setMatriculas([]);
      setMatriculasPresentes([]);
      return;
    }

    if (dataEhFutura(novaData)) {
      setMatriculas([]);
      setMatriculasPresentes([]);
      setErro("A data da chamada não pode ser futura.");
      return;
    }

    try {
      setCarregandoAlunos(true);
      setErro("");

      const turma = Number(novaTurmaId);
      const dataApi = converterDataParaApi(novaData);

      const [matriculasResposta, presencasResposta] = await Promise.all([
        listarMatriculasAtivasPorTurma(turma, dataApi),
        listarPresencasPorTurmaEData(turma, dataApi),
      ]);

      const listaMatriculas = matriculasResposta ?? [];
      const listaPresencas = presencasResposta ?? [];

      const presentes = listaPresencas
        .filter((presenca: any) => presenca.presente === true)
        .map((presenca: any) => Number(presenca.matriculaId));

      setMatriculas(listaMatriculas);
      setMatriculasPresentes(presentes);
    } catch (error: any) {
      console.error(error);

      setMatriculas([]);
      setMatriculasPresentes([]);

      setErro(
        error?.message || "Não foi possível carregar os alunos da chamada.",
      );
    } finally {
      setCarregandoAlunos(false);
    }
  }

  function selecionarTurma(item: { id: number | string; nome: string }) {
    const id = String(item.id);

    setTurmaId(id);

    carregarChamada(id, data);
  }

  function alterarData(novaData: string) {
    const dataFormatada = formatarData(novaData);

    setData(dataFormatada);

    if (dataFormatada.length === 10) {
      carregarChamada(turmaId, dataFormatada);
    } else {
      setMatriculas([]);
      setMatriculasPresentes([]);
      setErro("");
    }
  }

  function alternarPresenca(matriculaId: number) {
    setMatriculasPresentes((estadoAtual) => {
      if (estadoAtual.includes(matriculaId)) {
        return estadoAtual.filter((id) => id !== matriculaId);
      }

      return [...estadoAtual, matriculaId];
    });
  }

  function marcarTodos() {
    setMatriculasPresentes(matriculas.map((matricula) => Number(matricula.id)));
  }

  function desmarcarTodos() {
    setMatriculasPresentes([]);
  }

  async function salvarChamada() {
    setErro("");

    if (!turmaId) {
      setErro("Selecione a turma.");
      return;
    }

    if (data.length !== 10 || !dataValida(data)) {
      setErro("Informe uma data válida.");
      return;
    }

    if (dataEhFutura(data)) {
      setErro("A data da chamada não pode ser futura.");
      return;
    }

    try {
      setSalvando(true);

      const dataApi = converterDataParaApi(data);

      await registrarChamada({
        turmaId: Number(turmaId),
        data: dataApi,
        matriculaIdsPresentes: matriculasPresentes,
      });

      Alert.alert("Chamada salva", "A chamada foi registrada com sucesso.", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/presencas"),
        },
      ]);
    } catch (error: any) {
      console.error(error);

      setErro(error?.message || "Não foi possível salvar a chamada.");
    } finally {
      setSalvando(false);
    }
  }

  const opcoesTurmas = turmas.map((turma) => ({
    id: turma.id,
    nome: turma.nome,
  }));

  const total = matriculas.length;
  const presentes = matriculasPresentes.length;
  const ausentes = total - presentes;

  return (
    <RotaPermissao permissao="PRESENCA_CRIAR">
      <>
        <Stack.Screen
          options={{
            title: "Nova chamada",
          }}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.titulo}>Registrar chamada</Text>

            <Text style={styles.subtitulo}>
              Selecione a turma e a data para registrar a presença dos alunos.
            </Text>

            <SelectInput
              label="Turma"
              value={String(turmaId)}
              placeholder={
                carregandoTurmas ? "Carregando turmas..." : "Selecione a turma"
              }
              options={opcoesTurmas}
              selectedId={String(turmaId)}
              onSelect={selecionarTurma}
            />

            <View style={styles.campo}>
              <Text style={styles.label}>Data</Text>

              <TextInput
                style={styles.input}
                value={data}
                onChangeText={alterarData}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#777777"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>

          {carregandoAlunos ? (
            <View style={styles.carregando}>
              <ActivityIndicator size="large" color="#C1121F" />

              <Text style={styles.textoCarregando}>Carregando alunos...</Text>
            </View>
          ) : null}

          {!carregandoAlunos && matriculas.length > 0 ? (
            <>
              <View style={styles.card}>
                <View style={styles.resumoCabecalho}>
                  <View>
                    <Text style={styles.tituloSecao}>Alunos da turma</Text>

                    <Text style={styles.textoResumo}>
                      {total} aluno{total !== 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View style={styles.acoes}>
                    <Pressable style={styles.botaoAcao} onPress={marcarTodos}>
                      <Text style={styles.textoBotaoAcao}>Marcar todos</Text>
                    </Pressable>

                    <Pressable
                      style={styles.botaoAcao}
                      onPress={desmarcarTodos}
                    >
                      <Text style={styles.textoBotaoAcao}>Limpar</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.resumo}>
                  <View style={styles.resumoItem}>
                    <Text style={styles.resumoNumero}>{presentes}</Text>

                    <Text style={styles.resumoLabel}>Presentes</Text>
                  </View>

                  <View style={styles.resumoItem}>
                    <Text style={styles.resumoNumero}>{ausentes}</Text>

                    <Text style={styles.resumoLabel}>Ausentes</Text>
                  </View>

                  <View style={styles.resumoItem}>
                    <Text style={styles.resumoNumero}>{total}</Text>

                    <Text style={styles.resumoLabel}>Total</Text>
                  </View>
                </View>

                <View style={styles.lista}>
                  {matriculas.map((matricula) => {
                    const id = Number(matricula.id);
                    const presente = matriculasPresentes.includes(id);

                    return (
                      <Pressable
                        key={matricula.id}
                        style={[styles.aluno, presente && styles.alunoPresente]}
                        onPress={() => alternarPresenca(id)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            presente && styles.checkboxMarcado,
                          ]}
                        >
                          {presente ? (
                            <Text style={styles.check}>✓</Text>
                          ) : null}
                        </View>

                        <View style={styles.dadosAluno}>
                          <Text style={styles.nomeAluno}>
                            {matricula.alunoNome}
                          </Text>

                          <Text
                            style={[
                              styles.statusAluno,
                              presente && styles.statusAlunoPresente,
                            ]}
                          >
                            {presente ? "Presente" : "Ausente"}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Permissao permissao="PRESENCA_CRIAR" esconder>
                <Pressable
                  style={[
                    styles.botaoSalvar,
                    salvando && styles.botaoDesabilitado,
                  ]}
                  onPress={salvarChamada}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.textoBotaoSalvar}>Salvar chamada</Text>
                  )}
                </Pressable>
              </Permissao>

              <Pressable
                style={styles.botaoCancelar}
                onPress={() => router.back()}
                disabled={salvando}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </Pressable>
            </>
          ) : null}

          {!carregandoAlunos &&
          turmaId &&
          data.length === 10 &&
          dataValida(data) &&
          !dataEhFutura(data) &&
          matriculas.length === 0 &&
          !erro ? (
            <View style={styles.cardVazio}>
              <Text style={styles.textoVazio}>
                Não existem alunos ativos nesta turma para a data informada.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  conteudo: {
    padding: 16,
    paddingBottom: 80,
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 12,
    padding: 16,
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

  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  subtitulo: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 20,
    lineHeight: 20,
  },

  campo: {
    marginTop: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CCCCCC",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "#0D0D0D",
  },

  erro: {
    color: "#E04B55",
    fontSize: 14,
    marginTop: 12,
  },

  carregando: {
    alignItems: "center",
    paddingVertical: 30,
  },

  textoCarregando: {
    marginTop: 10,
    color: "#888888",
    fontSize: 14,
  },

  resumoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  textoResumo: {
    fontSize: 13,
    color: "#888888",
    marginTop: 3,
  },

  acoes: {
    flexDirection: "row",
    gap: 8,
  },

  botaoAcao: {
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "#0D0D0D",
  },

  textoBotaoAcao: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CCCCCC",
  },

  resumo: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#2B2B2B",
    paddingVertical: 14,
    marginBottom: 12,
  },

  resumoItem: {
    flex: 1,
    alignItems: "center",
  },

  resumoNumero: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  resumoLabel: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },

  lista: {
    marginTop: 4,
  },

  aluno: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
  },

  alunoPresente: {
    backgroundColor: "#12351F",
    borderColor: "#2A6B43",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#555555",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  checkboxMarcado: {
    backgroundColor: "#C1121F",
    borderColor: "#C1121F",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  dadosAluno: {
    flex: 1,
  },

  nomeAluno: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  statusAluno: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },

  statusAlunoPresente: {
    color: "#75D89A",
  },

  botaoSalvar: {
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

  textoBotaoSalvar: {
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

  textoBotaoCancelar: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "600",
  },

  cardVazio: {
    backgroundColor: "#151515",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#242424",
  },

  textoVazio: {
    textAlign: "center",
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
  },
});
