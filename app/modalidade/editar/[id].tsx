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
  atualizarModalidade,
  buscarModalidade,
} from "@/services/modalidadeService";

export default function EditarModalidadeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativa, setAtiva] = useState(true);

  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarModalidade();
  }, [id]);

  async function carregarModalidade() {
    try {
      setMensagem("");
      setCarregando(true);

      const modalidade = await buscarModalidade(id);

      setNome(modalidade.nome ?? "");
      setDescricao(modalidade.descricao ?? "");
      setAtiva(modalidade.ativa ?? true);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar modalidade.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da modalidade.");
      return;
    }

    try {
      setSalvando(true);

      await atualizarModalidade(id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        ativa,
      });

      Alert.alert("Sucesso", "Modalidade atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/modalidades"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a modalidade.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="MODALIDADE_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="MODALIDADE_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando modalidade...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MODALIDADE_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar modalidade",
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
              <Text style={styles.titulo}>Editar modalidade</Text>

              <Text style={styles.subtitulo}>
                Atualize os dados da modalidade
              </Text>
            </View>

            {/* Dados da modalidade */}

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🥋</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados da modalidade</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações da modalidade
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome da modalidade *</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Jiu-Jitsu"
                placeholderTextColor="#777777"
                autoCapitalize="words"
                editable={!salvando}
              />

              <Text style={styles.label}>Descrição</Text>

              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição da modalidade..."
                placeholderTextColor="#777777"
                multiline
                textAlignVertical="top"
                editable={!salvando}
              />

              <Text style={styles.label}>Situação</Text>

              <View style={styles.linhaStatus}>
                <TouchableOpacity
                  style={[styles.botaoStatus, ativa && styles.botaoStatusAtiva]}
                  onPress={() => setAtiva(true)}
                  disabled={salvando}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      ativa && styles.botaoStatusTextoAtiva,
                    ]}
                  >
                    Ativa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoStatus,
                    !ativa && styles.botaoStatusInativa,
                  ]}
                  onPress={() => setAtiva(false)}
                  disabled={salvando}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      !ativa && styles.botaoStatusTextoInativa,
                    ]}
                  >
                    Inativa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Salvar */}

            <Permissao permissao="MODALIDADE_EDITAR" esconder>
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

  inputMultiline: {
    height: 100,
    paddingTop: 12,
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

  botaoStatusAtiva: {
    backgroundColor: "#12351F",
    borderColor: "#2A6B43",
  },

  botaoStatusInativa: {
    backgroundColor: "#3A171A",
    borderColor: "#5A2529",
  },

  botaoStatusTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888888",
  },

  botaoStatusTextoAtiva: {
    color: "#75D89A",
  },

  botaoStatusTextoInativa: {
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
