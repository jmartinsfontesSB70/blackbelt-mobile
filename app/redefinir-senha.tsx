import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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

import { redefinirSenha } from "@/services/authService";

export default function RedefinirSenhaScreen() {
  const router = useRouter();

  const { token } = useLocalSearchParams<{
    token: string;
  }>();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [salvando, setSalvando] = useState(false);

  async function handleRedefinirSenha() {
    if (!token) {
      Alert.alert(
        "Erro",
        "O link de recuperação é inválido ou está incompleto.",
      );
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

      await redefinirSenha(token, novaSenha);

      Alert.alert("Sucesso", "Senha redefinida com sucesso.", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível redefinir a senha.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoArea}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>B</Text>
            </View>

            <Text style={styles.logo}>BLACKBELT</Text>

            <Text style={styles.subtitle}>
              Gestão inteligente para academias
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Nova senha</Text>

            <Text style={styles.description}>
              Crie uma nova senha para voltar a acessar sua conta.
            </Text>

            <Text style={styles.label}>Nova senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua nova senha"
              placeholderTextColor="#777"
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!salvando}
            />

            <Text style={styles.label}>Confirme sua nova senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#777"
              value={confirmacaoSenha}
              onChangeText={setConfirmacaoSenha}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!salvando}
            />

            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Sua senha deve ter:</Text>

              <Text style={styles.hintText}>• Pelo menos 6 caracteres</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, salvando && styles.buttonDisabled]}
              onPress={handleRedefinirSenha}
              disabled={salvando}
              activeOpacity={0.8}
            >
              {salvando ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text style={styles.buttonLoadingText}>Salvando...</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>REDEFINIR SENHA</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/")}
              disabled={salvando}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>BLACKBELT • GESTÃO PARA ACADEMIAS</Text>
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

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  logoArea: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  logoMarkText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    fontStyle: "italic",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 3,
  },

  subtitle: {
    color: "#888888",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#242424",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 8,
  },

  description: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 28,
  },

  label: {
    color: "#CCCCCC",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    height: 54,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 18,
  },

  hintBox: {
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    padding: 14,
    marginTop: 2,
    marginBottom: 22,
  },

  hintTitle: {
    color: "#BBBBBB",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },

  hintText: {
    color: "#777777",
    fontSize: 12,
  },

  button: {
    minHeight: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C1121F",
    marginTop: 2,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  buttonLoadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
  },

  backButton: {
    alignItems: "center",
    marginTop: 20,
  },

  backText: {
    color: "#E04B55",
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 28,
  },
});
