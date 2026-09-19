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

import {
  atualizarGraduacao,
  buscarGraduacaoPorId,
} from "@/services/graduacaoService";

import RotaPermissao from "@/components/RotaPermissao";

export default function EditarGraduacaoScreen() {
  const router = useRouter();

  const { id, graduacaoId } = useLocalSearchParams<{
    id: string;
    graduacaoId: string;
  }>();

  const [nome, setNome] = useState("");
  const [ordem, setOrdem] = useState("");
  const [quantidadeGraus, setQuantidadeGraus] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarGraduacao();
  }, [graduacaoId]);

  async function carregarGraduacao() {
    if (!graduacaoId) {
      Alert.alert("Erro", "Graduação não informada.");
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);

      const dados = await buscarGraduacaoPorId(graduacaoId);

      setNome(dados.nome ?? "");
      setOrdem(
        dados.ordem !== null && dados.ordem !== undefined
          ? dados.ordem.toString()
          : "",
      );
      setQuantidadeGraus(
        dados.quantidadeGraus !== null && dados.quantidadeGraus !== undefined
          ? dados.quantidadeGraus.toString()
          : "",
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível carregar", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível carregar a graduação.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function validarFormulario(): boolean {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da graduação.");
      return false;
    }

    if (!ordem.trim()) {
      Alert.alert("Atenção", "Informe a ordem da graduação.");
      return false;
    }

    const ordemNumero = Number(ordem);

    if (!Number.isInteger(ordemNumero) || ordemNumero < 0) {
      Alert.alert(
        "Atenção",
        "A ordem deve ser um número inteiro maior ou igual a zero.",
      );
      return false;
    }

    if (!quantidadeGraus.trim()) {
      Alert.alert("Atenção", "Informe a quantidade de graus.");
      return false;
    }

    const quantidadeGrausNumero = Number(quantidadeGraus);

    if (!Number.isInteger(quantidadeGrausNumero) || quantidadeGrausNumero < 0) {
      Alert.alert(
        "Atenção",
        "A quantidade de graus deve ser um número inteiro maior ou igual a zero.",
      );
      return false;
    }

    return true;
  }

  async function salvar() {
    if (!validarFormulario()) {
      return;
    }

    if (!graduacaoId) {
      Alert.alert("Erro", "Graduação não informada.");
      return;
    }

    if (!id) {
      Alert.alert("Erro", "Modalidade não informada.");
      return;
    }

    try {
      setSalvando(true);

      await atualizarGraduacao(graduacaoId, {
        modalidadeId: Number(id),
        nome: nome.trim(),
        ordem: Number(ordem),
        quantidadeGraus: Number(quantidadeGraus),
      });

      Alert.alert("Sucesso", "Graduação atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo(`/modalidade/${id}/graduacoes`),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível atualizar", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a graduação.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="MODALIDADE_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando graduação...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="MODALIDADE_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar Graduação",
          }}
        />

        <KeyboardAvoidingView
          style={styles.tela}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cabecalho}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>🥋</Text>
              </View>

              <View style={styles.cabecalhoInfo}>
                <Text style={styles.titulo}>Editar Graduação</Text>

                <Text style={styles.subtitulo}>
                  Altere os dados da graduação
                </Text>
              </View>
            </View>

            <View style={styles.formulario}>
              <Text style={styles.label}>Nome da graduação</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Faixa Branca"
                placeholderTextColor="#666666"
                editable={!salvando}
                autoCapitalize="sentences"
              />

              <Text style={styles.label}>Ordem</Text>

              <TextInput
                style={styles.input}
                value={ordem}
                onChangeText={setOrdem}
                placeholder="Ex.: 1"
                placeholderTextColor="#666666"
                editable={!salvando}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Quantidade de graus</Text>

              <TextInput
                style={styles.input}
                value={quantidadeGraus}
                onChangeText={setQuantidadeGraus}
                placeholder="Ex.: 4"
                placeholderTextColor="#666666"
                editable={!salvando}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.acoes}>
              <Pressable
                style={styles.botaoCancelar}
                onPress={() => router.back()}
                disabled={salvando}
              >
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.botaoSalvar,
                  salvando && styles.botaoDesabilitado,
                ]}
                onPress={salvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoSalvarTexto}>Salvar</Text>
                )}
              </Pressable>
            </View>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarTexto: {
    fontSize: 25,
  },

  cabecalhoInfo: {
    flex: 1,
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  subtitulo: {
    marginTop: 4,
    color: "#888888",
    fontSize: 15,
  },

  formulario: {
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#242424",
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#0F0F0F",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  acoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  botaoCancelar: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  botaoCancelarTexto: {
    color: "#BBBBBB",
    fontSize: 16,
    fontWeight: "600",
  },

  botaoSalvar: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  botaoSalvarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.6,
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
