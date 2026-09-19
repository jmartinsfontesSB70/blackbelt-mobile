import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import RotaPermissao from "@/components/RotaPermissao";
import SelectInput from "@/components/SelectInput";

import { listarMatriculasAtivasPorAluno } from "@/services/matriculaService";

import { listarGraduacoesPorModalidade } from "@/services/graduacaoService";

import { cadastrarHistoricoGraduacao } from "@/services/historicoGraduacaoService";

type SelectOption = {
  id: number | string;
  nome: string;
};

export default function NovoHistoricoGraduacaoScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [modalidades, setModalidades] = useState<SelectOption[]>([]);
  const [graduacoes, setGraduacoes] = useState<SelectOption[]>([]);

  const [modalidadeId, setModalidadeId] = useState("");
  const [graduacaoId, setGraduacaoId] = useState("");

  const [grau, setGrau] = useState("0");

  const [data, setData] = useState(() => {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${dia}/${mes}/${ano}`;
  });

  const [observacao, setObservacao] = useState("");

  const [carregandoModalidades, setCarregandoModalidades] = useState(true);

  const [carregandoGraduacoes, setCarregandoGraduacoes] = useState(false);

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarModalidades();
  }, [id]);

  async function carregarModalidades() {
    if (!id) {
      return;
    }

    try {
      setCarregandoModalidades(true);

      const matriculas = await listarMatriculasAtivasPorAluno(Number(id));

      const modalidadesUnicas = new Map<string, SelectOption>();

      matriculas.forEach((matricula: any) => {
        if (matricula.modalidadeId != null && matricula.modalidadeNome) {
          const chave = String(matricula.modalidadeId);

          if (!modalidadesUnicas.has(chave)) {
            modalidadesUnicas.set(chave, {
              id: matricula.modalidadeId,
              nome: matricula.modalidadeNome,
            });
          }
        }
      });

      setModalidades(Array.from(modalidadesUnicas.values()));
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível carregar as modalidades do aluno.",
      );
    } finally {
      setCarregandoModalidades(false);
    }
  }

  async function selecionarModalidade(item: SelectOption) {
    setModalidadeId(String(item.id));

    setGraduacaoId("");
    setGraduacoes([]);

    try {
      setCarregandoGraduacoes(true);

      const dados = await listarGraduacoesPorModalidade(String(item.id));

      const opcoes = dados.map((graduacao: any) => ({
        id: graduacao.id,
        nome: graduacao.nome,
      }));

      setGraduacoes(opcoes);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível carregar as graduações.",
      );
    } finally {
      setCarregandoGraduacoes(false);
    }
  }

  function selecionarGraduacao(item: SelectOption) {
    setGraduacaoId(String(item.id));
  }

  function validarEConverterData(valor: string): {
    dataApi: string | null;
    mensagem: string | null;
  } {
    const partes = valor.split("/");

    if (partes.length !== 3) {
      return {
        dataApi: null,
        mensagem: "Informe uma data no formato DD/MM/AAAA.",
      };
    }

    const [diaTexto, mesTexto, anoTexto] = partes;

    if (
      diaTexto.length !== 2 ||
      mesTexto.length !== 2 ||
      anoTexto.length !== 4
    ) {
      return {
        dataApi: null,
        mensagem: "Informe uma data no formato DD/MM/AAAA.",
      };
    }

    const dia = Number(diaTexto);
    const mes = Number(mesTexto);
    const ano = Number(anoTexto);

    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(ano)
    ) {
      return {
        dataApi: null,
        mensagem: "Informe uma data válida.",
      };
    }

    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return {
        dataApi: null,
        mensagem: "Informe uma data válida.",
      };
    }

    const dataInformada = new Date(ano, mes - 1, dia);

    const dataRealmenteValida =
      dataInformada.getFullYear() === ano &&
      dataInformada.getMonth() === mes - 1 &&
      dataInformada.getDate() === dia;

    if (!dataRealmenteValida) {
      return {
        dataApi: null,
        mensagem: "A data informada não existe.",
      };
    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);
    dataInformada.setHours(0, 0, 0, 0);

    if (dataInformada > hoje) {
      return {
        dataApi: null,
        mensagem: "A data da graduação não pode ser futura.",
      };
    }

    return {
      dataApi: `${anoTexto}-${mesTexto}-${diaTexto}`,
      mensagem: null,
    };
  }

  async function salvar() {
    if (!id) {
      Alert.alert("Erro", "Aluno não informado.");
      return;
    }

    if (!modalidadeId) {
      Alert.alert("Validação", "Selecione uma modalidade.");
      return;
    }

    if (!graduacaoId) {
      Alert.alert("Validação", "Selecione uma graduação.");
      return;
    }

    const grauNumero = Number(grau);

    if (!Number.isInteger(grauNumero) || grauNumero < 0) {
      Alert.alert(
        "Validação",
        "O grau deve ser um número inteiro maior ou igual a zero.",
      );
      return;
    }

    const resultadoData = validarEConverterData(data);

    if (!resultadoData.dataApi) {
      Alert.alert(
        "Validação",
        resultadoData.mensagem || "Informe uma data válida.",
      );
      return;
    }

    try {
      setSalvando(true);

      await cadastrarHistoricoGraduacao({
        alunoId: Number(id),
        graduacaoId: Number(graduacaoId),
        grau: grauNumero,
        data: resultadoData.dataApi,
        observacao: observacao.trim() || null,
      });

      Alert.alert("Sucesso", "Histórico de graduação registrado.", [
        {
          text: "OK",
          onPress: () => router.dismissTo(`/aluno/${id}/historico-graduacao`),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message ||
          "Não foi possível registrar o histórico de graduação.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="ALUNO_LISTAR">
      <Stack.Screen
        options={{
          title: "Registrar Graduação",
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>🥋 Registrar Graduação</Text>

          {carregandoModalidades ? (
            <View style={styles.carregando}>
              <ActivityIndicator size="small" />

              <Text style={styles.carregandoTexto}>
                Carregando modalidades...
              </Text>
            </View>
          ) : (
            <SelectInput
              label="Modalidade *"
              value=""
              placeholder="Selecione uma modalidade"
              options={modalidades}
              selectedId={modalidadeId}
              onSelect={selecionarModalidade}
            />
          )}

          {modalidadeId ? (
            carregandoGraduacoes ? (
              <View style={styles.carregando}>
                <ActivityIndicator size="small" />

                <Text style={styles.carregandoTexto}>
                  Carregando graduações...
                </Text>
              </View>
            ) : (
              <SelectInput
                label="Graduação *"
                value=""
                placeholder="Selecione uma graduação"
                options={graduacoes}
                selectedId={graduacaoId}
                onSelect={selecionarGraduacao}
              />
            )
          ) : null}

          <Text style={styles.label}>Grau *</Text>

          <TextInput
            style={styles.input}
            value={grau}
            onChangeText={setGrau}
            keyboardType="number-pad"
            placeholder="Informe o grau"
            placeholderTextColor="#777777"
            editable={!salvando}
          />

          <Text style={styles.label}>Data *</Text>

          <TextInput
            style={styles.input}
            value={data}
            onChangeText={setData}
            keyboardType="number-pad"
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#777777"
            maxLength={10}
            editable={!salvando}
          />

          <Text style={styles.label}>Observação</Text>

          <TextInput
            style={[styles.input, styles.inputObservacao]}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Observação opcional"
            placeholderTextColor="#777777"
            multiline
            textAlignVertical="top"
            maxLength={500}
            editable={!salvando}
          />

          <Pressable
            style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
            onPress={salvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botaoSalvarTexto}>Registrar</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.botaoCancelar}
            onPress={() => router.back()}
            disabled={salvando}
          >
            <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  conteudo: {
    padding: 16,
    paddingBottom: 30,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
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
    color: "#FFFFFF",
    fontSize: 15,
  },

  inputObservacao: {
    height: 110,
    paddingTop: 13,
    paddingBottom: 13,
  },

  carregando: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  carregandoTexto: {
    color: "#AAAAAA",
    fontSize: 14,
    marginLeft: 10,
  },

  botaoSalvar: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  botaoSalvarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoCancelar: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  botaoCancelarTexto: {
    color: "#AAAAAA",
    fontSize: 15,
    fontWeight: "600",
  },
});
