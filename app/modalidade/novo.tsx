import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { criarModalidade } from "@/services/modalidadeService";

export default function NovaModalidadeScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome da modalidade.");
      return;
    }

    try {
      setSalvando(true);

      await criarModalidade({
        nome: nome.trim(),
        descricao: descricao.trim(),
        ativa,
      });

      Alert.alert("Sucesso", "Modalidade cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/modalidades"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar a modalidade.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="MODALIDADE_CRIAR">
      <>
        <Stack.Screen
          options={{
            title: "Nova modalidade",
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
              <Text style={styles.titulo}>Nova modalidade</Text>

              <Text style={styles.subtitulo}>
                Cadastre uma nova modalidade no BlackBelt
              </Text>
            </View>

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
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />

              <Text style={styles.label}>Descrição</Text>

              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição da modalidade..."
                placeholderTextColor="#9ca3af"
                multiline
              />

              <View style={styles.linhaAtiva}>
                <View>
                  <Text style={styles.label}>Modalidade ativa</Text>

                  <Text style={styles.textoSituacao}>
                    {ativa
                      ? "A modalidade estará ativa."
                      : "A modalidade estará inativa."}
                  </Text>
                </View>

                <Switch value={ativa} onValueChange={setAtiva} />
              </View>
            </View>

            <Permissao permissao="MODALIDADE_CRIAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.botaoTexto}>Cadastrar modalidade</Text>
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

  inputMultiline: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  linhaAtiva: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  textoSituacao: {
    fontSize: 12,
    color: "#9ca3af",
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
