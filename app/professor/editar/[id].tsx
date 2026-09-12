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

import {
  formatarCep,
  formatarCpf,
  formatarData,
  formatarDataExibicao,
  formatarDataParaApi,
  formatarTelefone,
} from "@/utils/masks";

import {
  atualizarProfessor,
  buscarProfessor,
} from "@/services/professorService";

export default function EditarProfessorScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataContratacao, setDataContratacao] = useState("");
  const [valorHoraAula, setValorHoraAula] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarProfessor();
  }, [id]);

  async function carregarProfessor() {
    try {
      setMensagem("");
      setCarregando(true);

      const professor = await buscarProfessor(id);

      setNome(professor.nome ?? "");

      setCpf(professor.cpf ? formatarCpf(professor.cpf) : "");

      setDataNascimento(
        professor.dataNascimento
          ? formatarDataExibicao(professor.dataNascimento)
          : "",
      );

      setTelefone(
        professor.telefone ? formatarTelefone(professor.telefone) : "",
      );

      setEmail(professor.email ?? "");

      setDataContratacao(
        professor.dataContratacao
          ? formatarDataExibicao(professor.dataContratacao)
          : "",
      );

      setValorHoraAula(
        professor.valorHoraAula !== null &&
          professor.valorHoraAula !== undefined
          ? String(professor.valorHoraAula).replace(".", ",")
          : "",
      );

      setAtivo(professor.ativo ?? true);

      if (professor.endereco) {
        setRua(professor.endereco.rua ?? "");
        setNumero(professor.endereco.numero ?? "");
        setBairro(professor.endereco.bairro ?? "");
        setCidade(professor.endereco.cidade ?? "");
        setEstado(professor.endereco.estado ?? "");

        setCep(
          professor.endereco.cep ? formatarCep(professor.endereco.cep) : "",
        );

        setPontoReferencia(professor.endereco.pontoReferencia ?? "");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar professor.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function validarData(data_digitada: string, campo: string) {
    const partes = data_digitada.split("/");

    if (partes.length !== 3) {
      Alert.alert("Atenção", `Informe uma ${campo} válida.`);
      return false;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(ano) ||
      dia < 1 ||
      dia > 31 ||
      mes < 1 ||
      mes > 12 ||
      ano < 1900
    ) {
      Alert.alert("Atenção", `Informe uma ${campo} válida.`);
      return false;
    }

    const data = new Date(ano, mes - 1, dia);

    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      Alert.alert("Atenção", `Informe uma ${campo} válida.`);
      return false;
    }

    return true;
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do professor.");
      return;
    }

    if (!cpf.trim()) {
      Alert.alert("Atenção", "Informe o CPF do professor.");
      return;
    }

    if (!dataNascimento.trim()) {
      Alert.alert("Atenção", "Informe a data de nascimento.");
      return;
    }

    if (!validarData(dataNascimento, "data de nascimento")) {
      return;
    }

    if (!dataContratacao.trim()) {
      Alert.alert("Atenção", "Informe a data de contratação.");
      return;
    }

    if (!validarData(dataContratacao, "data de contratação")) {
      return;
    }

    if (!valorHoraAula.trim()) {
      Alert.alert("Atenção", "Informe o valor da hora aula.");
      return;
    }

    if (!rua.trim()) {
      Alert.alert("Atenção", "Informe a rua.");
      return;
    }

    if (!numero.trim()) {
      Alert.alert("Atenção", "Informe o número.");
      return;
    }

    if (!bairro.trim()) {
      Alert.alert("Atenção", "Informe o bairro.");
      return;
    }

    if (!cidade.trim()) {
      Alert.alert("Atenção", "Informe a cidade.");
      return;
    }

    if (!estado.trim()) {
      Alert.alert("Atenção", "Informe o estado.");
      return;
    }

    if (!cep.trim()) {
      Alert.alert("Atenção", "Informe o CEP.");
      return;
    }

    try {
      setSalvando(true);

      const valorNumerico = Number(
        valorHoraAula.replace(/\./g, "").replace(",", "."),
      );

      await atualizarProfessor(id, {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        dataNascimento: formatarDataParaApi(dataNascimento),
        telefone: telefone.replace(/\D/g, ""),
        email: email.trim(),
        dataContratacao: formatarDataParaApi(dataContratacao),
        valorHoraAula: valorNumerico,
        ativo,

        endereco: {
          rua: rua.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: estado.trim(),
          cep: cep.replace(/\D/g, ""),
          pontoReferencia: pontoReferencia.trim(),
        },
      });

      Alert.alert("Sucesso", "Professor atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/professores"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o professor.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="PROFESSOR_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="PROFESSOR_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando professor...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="PROFESSOR_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar professor",
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
              <Text style={styles.titulo}>Editar professor</Text>

              <Text style={styles.subtitulo}>
                Atualize os dados do professor
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🥋</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados do professor</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações pessoais e profissionais
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome completo *</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome completo"
                placeholderTextColor="#777777"
                autoCapitalize="words"
              />

              <View style={styles.linha}>
                <View style={styles.campoMaior}>
                  <Text style={styles.label}>CPF *</Text>

                  <TextInput
                    style={styles.input}
                    value={cpf}
                    onChangeText={(texto) => setCpf(formatarCpf(texto))}
                    placeholder="000.000.000-00"
                    placeholderTextColor="#777777"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.campoMenor}>
                  <Text style={styles.label}>Nascimento *</Text>

                  <TextInput
                    style={styles.input}
                    value={dataNascimento}
                    onChangeText={(texto) =>
                      setDataNascimento(formatarData(texto))
                    }
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#777777"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Telefone</Text>

              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#777777"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>E-mail *</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemplo.com"
                placeholderTextColor="#777777"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.linha}>
                <View style={styles.campoMaior}>
                  <Text style={styles.label}>Contratação *</Text>

                  <TextInput
                    style={styles.input}
                    value={dataContratacao}
                    onChangeText={(texto) =>
                      setDataContratacao(formatarData(texto))
                    }
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#777777"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.campoMenor}>
                  <Text style={styles.label}>Hora aula *</Text>

                  <TextInput
                    style={styles.input}
                    value={valorHoraAula}
                    onChangeText={setValorHoraAula}
                    placeholder="0,00"
                    placeholderTextColor="#777777"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.label}>Situação</Text>

              <View style={styles.linhaStatus}>
                <TouchableOpacity
                  style={[styles.botaoStatus, ativo && styles.botaoStatusAtivo]}
                  onPress={() => setAtivo(true)}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      ativo && styles.botaoStatusTextoAtivo,
                    ]}
                  >
                    Ativo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoStatus,
                    !ativo && styles.botaoStatusInativo,
                  ]}
                  onPress={() => setAtivo(false)}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      !ativo && styles.botaoStatusTextoInativo,
                    ]}
                  >
                    Inativo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>📍</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Endereço</Text>

                  <Text style={styles.descricaoSecao}>
                    Localização e endereço residencial
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>CEP *</Text>

              <TextInput
                style={styles.input}
                value={cep}
                onChangeText={(texto) => setCep(formatarCep(texto))}
                placeholder="00000-000"
                placeholderTextColor="#777777"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Rua *</Text>

              <TextInput
                style={styles.input}
                value={rua}
                onChangeText={setRua}
                placeholder="Nome da rua"
                placeholderTextColor="#777777"
                autoCapitalize="words"
              />

              <View style={styles.linha}>
                <View style={styles.campoNumero}>
                  <Text style={styles.label}>Número *</Text>

                  <TextInput
                    style={styles.input}
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="Número"
                    placeholderTextColor="#777777"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.campoComplemento}>
                  <Text style={styles.label}>Bairro *</Text>

                  <TextInput
                    style={styles.input}
                    value={bairro}
                    onChangeText={setBairro}
                    placeholder="Bairro"
                    placeholderTextColor="#777777"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.linha}>
                <View style={styles.cidade}>
                  <Text style={styles.label}>Cidade *</Text>

                  <TextInput
                    style={styles.input}
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="Cidade"
                    placeholderTextColor="#777777"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.estado}>
                  <Text style={styles.label}>UF *</Text>

                  <TextInput
                    style={styles.input}
                    value={estado}
                    onChangeText={setEstado}
                    placeholder="BA"
                    placeholderTextColor="#777777"
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
              </View>

              <Text style={styles.label}>Ponto de referência</Text>

              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={pontoReferencia}
                onChangeText={setPontoReferencia}
                placeholder="Ex.: próximo à academia..."
                placeholderTextColor="#777777"
                multiline
              />
            </View>

            <Permissao permissao="PROFESSOR_EDITAR" esconder>
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
    flex: 1.15,
  },

  campoMenor: {
    flex: 1,
  },

  campoNumero: {
    width: 100,
  },

  campoComplemento: {
    flex: 1,
  },

  cidade: {
    flex: 1,
  },

  estado: {
    width: 75,
  },

  inputMultiline: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
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
