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
          />

          <TouchableOpacity
            style={[styles.botao, salvando && styles.botaoDesabilitado]}
            onPress={handleAlterarSenha}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.textoBotao}>Alterar senha</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 28,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },

  botao: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
