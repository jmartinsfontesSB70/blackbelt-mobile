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
} from "react-native";

import { alterarMinhaSenha } from "@/services/usuarioService";

export default function AlterarSenhaScreen() {
  const router = useRouter();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [salvando, setSalvando] = useState(false);

  async function handleAlterarSenha() {
    if (!senhaAtual.trim()) {
      Alert.alert("Atenção", "Informe a senha atual.");
      return;
    }

    if (!novaSenha.trim()) {
      Alert.alert("Atenção", "Informe a nova senha.");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert(
        "Atenção",
        "A nova senha deve possuir pelo menos 6 caracteres.",
      );
      return;
    }

    if (!confirmacaoSenha.trim()) {
      Alert.alert("Atenção", "Digite a nova senha novamente.");
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      Alert.alert("Atenção", "A confirmação da nova senha não confere.");
      return;
    }

    try {
      setSalvando(true);

      await alterarMinhaSenha(senhaAtual, novaSenha);

      Alert.alert("Sucesso", "Senha alterada com sucesso.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível alterar a senha.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Alterar senha",
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>Alterar senha</Text>

          <Text style={styles.label}>Senha atual</Text>

          <TextInput
            style={styles.input}
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!salvando}
            placeholderTextColor="#777777"
          />

          <Text style={styles.label}>Nova senha</Text>

          <TextInput
            style={styles.input}
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!salvando}
            placeholderTextColor="#777777"
          />

          <Text style={styles.label}>Digite a nova senha novamente</Text>

          <TextInput
            style={styles.input}
            value={confirmacaoSenha}
            onChangeText={setConfirmacaoSenha}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!salvando}
            placeholderTextColor="#777777"
          />

          <TouchableOpacity
            style={[styles.botao, salvando && styles.botaoDesabilitado]}
            onPress={handleAlterarSenha}
            disabled={salvando}
            activeOpacity={0.8}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotao}>Alterar senha</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={() => router.back()}
            disabled={salvando}
            activeOpacity={0.7}
          >
            <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  content: {
    padding: 24,
    paddingBottom: 80,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 28,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#CCCCCC",
    marginBottom: 8,
  },

  input: {
    height: 48,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
  },

  botao: {
    height: 52,
    marginTop: 10,
    backgroundColor: "#C1121F",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
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
});
