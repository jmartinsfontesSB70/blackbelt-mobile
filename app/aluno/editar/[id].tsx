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

import { atualizarAluno, buscarAluno } from "@/services/alunoService";

import {
  formatarCep,
  formatarCpf,
  formatarData,
  formatarDataExibicao,
  formatarDataParaApi,
  formatarTelefone,
} from "@/utils/masks";

export default function EditarAlunoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");

  useEffect(() => {
    carregarAluno();
  }, [id]);

  async function carregarAluno() {
    try {
      setCarregando(true);

      const resposta = await buscarAluno(id);

      setNome(resposta.nome ?? "");
      setCpf(formatarCpf(resposta.cpf ?? ""));
      setDataNascimento(formatarDataExibicao(resposta.dataNascimento ?? ""));
      setTelefone(formatarTelefone(resposta.telefone ?? ""));
      setEmail(resposta.email ?? "");

      setRua(resposta.endereco?.rua ?? "");
      setNumero(resposta.endereco?.numero ?? "");
      setBairro(resposta.endereco?.bairro ?? "");
      setCidade(resposta.endereco?.cidade ?? "");
      setEstado(resposta.endereco?.estado ?? "");
      setCep(formatarCep(resposta.endereco?.cep ?? ""));
      setPontoReferencia(resposta.endereco?.pontoReferencia ?? "");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message, [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Erro", "Não foi possível carregar o aluno.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do aluno.");
      return;
    }

    if (!cpf.trim()) {
      Alert.alert("Atenção", "Informe o CPF do aluno.");
      return;
    }

    if (!dataNascimento.trim()) {
      Alert.alert("Atenção", "Informe a data de nascimento.");
      return;
    }

    if (!validarDataNascimento(dataNascimento)) {
      Alert.alert(
        "Atenção",
        "Informe uma data de nascimento válida no formato DD/MM/AAAA.",
      );
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

      await atualizarAluno(id, {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        dataNascimento: formatarDataParaApi(dataNascimento),
        telefone: telefone.replace(/\D/g, ""),
        email: email.trim(),
        ativo: true,

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

      Alert.alert("Sucesso", "Aluno alterado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/alunos"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível alterar o aluno.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="ALUNO_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />
          <Text style={styles.carregandoTexto}>Carregando aluno...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="ALUNO_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar aluno",
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
              <Text style={styles.titulo}>Editar aluno</Text>
              <Text style={styles.subtitulo}>Altere os dados do aluno</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>👤</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados pessoais</Text>
                  <Text style={styles.descricaoSecao}>
                    Informações básicas do aluno
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
                    maxLength={10}
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

              <Text style={styles.label}>E-mail</Text>

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

            <Permissao permissao="ALUNO_EDITAR" esconder>
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

function validarDataNascimento(dataDigitada: string): boolean {
  const partes = dataDigitada.split("/");

  if (partes.length !== 3) {
    return false;
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  if (
    !Number.isInteger(dia) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(ano)
  ) {
    return false;
  }

  if (ano < 1900 || ano > 2100) {
    return false;
  }

  if (mes < 1 || mes > 12) {
    return false;
  }

  if (dia < 1 || dia > 31) {
    return false;
  }

  const data = new Date(ano, mes - 1, dia);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia
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
});
