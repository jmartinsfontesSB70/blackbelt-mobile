import { Stack, useRouter } from "expo-router";
import { useState } from "react";
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

import {
  formatarCep,
  formatarCpf,
  formatarData,
  formatarDataParaApi,
  formatarTelefone,
} from "@/utils/masks";

import { criarAluno } from "@/services/alunoService";

export default function NovoAlunoScreen() {
  const router = useRouter();

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

  const [salvando, setSalvando] = useState(false);

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

      await criarAluno({
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

      Alert.alert("Sucesso", "Aluno cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/alunos"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar o aluno.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Novo aluno",
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
          {/* Cabeçalho */}
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Novo aluno</Text>

            <Text style={styles.subtitulo}>
              Cadastre um novo aluno no BlackBelt
            </Text>
          </View>

          {/* Dados pessoais */}
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
              placeholderTextColor="#9ca3af"
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
                  placeholderTextColor="#9ca3af"
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
                  placeholderTextColor="#9ca3af"
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
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>E-mail</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Endereço */}
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
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Rua *</Text>

            <TextInput
              style={styles.input}
              value={rua}
              onChangeText={setRua}
              placeholder="Nome da rua"
              placeholderTextColor="#9ca3af"
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
                  placeholderTextColor="#9ca3af"
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
                  placeholderTextColor="#9ca3af"
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
                  placeholderTextColor="#9ca3af"
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
                  placeholderTextColor="#9ca3af"
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
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>

          {/* Cadastrar */}
          <TouchableOpacity
            style={[styles.botao, salvando && styles.botaoDesabilitado]}
            onPress={salvar}
            disabled={salvando}
            activeOpacity={0.8}
          >
            {salvando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.botaoTexto}>Cadastrar aluno</Text>
            )}
          </TouchableOpacity>

          {/* Cancelar */}
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
});
