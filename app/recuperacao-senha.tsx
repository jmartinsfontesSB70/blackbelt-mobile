import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { solicitarRecuperacaoSenha } from "@/services/authService";
import { useRouter } from "expo-router";

export default function RecuperacaoSenhaScreen() {
  const [identificador, setIdentificador] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const router = useRouter();

  async function solicitarRecuperacao() {
    setMensagem("");
    setErro("");

    const valor = identificador.trim();

    if (!valor) {
      setErro("Informe seu usuário ou e-mail.");
      return;
    }

    try {
      setEnviando(true);

      await solicitarRecuperacaoSenha(valor);

      setMensagem(
        "Se o usuário ou e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
      );
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível solicitar a recuperação da senha. Tente novamente.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  function voltarParaLogin() {
    router.replace("/");
  }

  return (
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

          <Text style={styles.subtitle}>Gestão inteligente para academias</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Recuperar senha</Text>

          <Text style={styles.description}>
            Informe seu usuário ou e-mail e enviaremos as instruções para
            recuperar o acesso à sua conta.
          </Text>

          <Text style={styles.label}>Usuário ou e-mail</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu usuário ou e-mail"
            placeholderTextColor="#777"
            value={identificador}
            onChangeText={setIdentificador}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="username"
            editable={!enviando}
          />

          <TouchableOpacity
            style={[styles.button, enviando && styles.buttonDisabled]}
            onPress={solicitarRecuperacao}
            disabled={enviando}
            activeOpacity={0.8}
          >
            {enviando ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.buttonLoadingText}>Enviando...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>ENVIAR INSTRUÇÕES</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={voltarParaLogin}
            disabled={enviando}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Voltar para o login</Text>
          </TouchableOpacity>

          {mensagem ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>E-mail enviado</Text>

              <Text style={styles.successText}>{mensagem}</Text>
            </View>
          ) : null}

          {erro ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footer}>BLACKBELT • GESTÃO PARA ACADEMIAS</Text>
      </ScrollView>
    </KeyboardAvoidingView>
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

  button: {
    minHeight: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C1121F",
    marginTop: 6,
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

  linkButton: {
    alignItems: "center",
    marginTop: 20,
  },

  linkText: {
    color: "#E04B55",
    fontSize: 14,
    fontWeight: "600",
  },

  successBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#101C16",
    borderWidth: 1,
    borderColor: "#1E4A32",
  },

  successTitle: {
    color: "#72D49A",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },

  successText: {
    color: "#A7CBB5",
    fontSize: 13,
    lineHeight: 20,
  },

  errorBox: {
    marginTop: 22,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#211315",
    borderWidth: 1,
    borderColor: "#472126",
  },

  errorText: {
    color: "#F08A91",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
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
