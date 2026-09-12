import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
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

import {
  ativarLoginBiometrico,
  fazerLogin,
  obterTokenBiometrico,
} from "@/services/authService";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [temBiometria, setTemBiometria] = useState(false);

  const router = useRouter();

  useEffect(() => {
    verificarBiometriaDisponivel();
  }, []);

  async function verificarBiometriaDisponivel() {
    try {
      const temHardware = await LocalAuthentication.hasHardwareAsync();

      if (!temHardware) {
        setTemBiometria(false);
        return;
      }

      const cadastrada = await LocalAuthentication.isEnrolledAsync();

      setTemBiometria(cadastrada);
    } catch {
      setTemBiometria(false);
    }
  }

  async function entrar() {
    try {
      setMensagem("");
      setEntrando(true);

      const resposta = await fazerLogin(identificador.trim(), password);

      setMensagem("Login realizado com sucesso!");

      Alert.alert(
        "Ativar login biométrico",
        "Deseja usar sua biometria para entrar mais rapidamente nas próximas vezes?",
        [
          {
            text: "Agora não",
            style: "cancel",
            onPress: () => {
              router.push("/menu");
            },
          },
          {
            text: "Ativar",
            onPress: async () => {
              try {
                await ativarLoginBiometrico(resposta.token);

                Alert.alert(
                  "Biometria ativada",
                  "Nas próximas vezes você poderá entrar usando sua biometria.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.push("/menu"),
                    },
                  ],
                );
              } catch {
                Alert.alert(
                  "Não foi possível ativar",
                  "O login biométrico não foi ativado neste momento.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.push("/menu"),
                    },
                  ],
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro desconhecido.");
      }
    } finally {
      setEntrando(false);
    }
  }

  async function entrarComBiometria() {
    try {
      setMensagem("");
      setEntrando(true);

      const token = await obterTokenBiometrico();

      if (!token) {
        setMensagem(
          "Login biométrico ainda não está ativado neste dispositivo.",
        );
        return;
      }

      await AsyncStorage.setItem("token", token);

      router.push("/menu");
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Não foi possível autenticar com biometria.");
      }
    } finally {
      setEntrando(false);
    }
  }

  function recuperarSenha() {
    router.push("/recuperacao-senha");
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
          <Text style={styles.title}>Bem-vindo</Text>

          <Text style={styles.description}>
            Entre para acessar sua academia.
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
            editable={!entrando}
          />

          <Text style={styles.label}>Senha</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            editable={!entrando}
          />

          <TouchableOpacity
            style={[styles.button, entrando && styles.buttonDisabled]}
            onPress={entrar}
            disabled={entrando}
            activeOpacity={0.8}
          >
            {entrando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          {temBiometria ? (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={entrarComBiometria}
              disabled={entrando}
              activeOpacity={0.8}
            >
              <Text style={styles.biometricButtonText}>
                🔐 ENTRAR COM BIOMETRIA
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={recuperarSenha}
            disabled={entrando}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {mensagem ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{mensagem}</Text>
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
    marginBottom: 6,
  },

  description: {
    color: "#888888",
    fontSize: 14,
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
    height: 54,
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
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },

  biometricButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    marginTop: 12,
  },

  biometricButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  forgotButton: {
    alignItems: "center",
    marginTop: 20,
  },

  forgotText: {
    color: "#E04B55",
    fontSize: 14,
    fontWeight: "600",
  },

  messageBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#211315",
    borderWidth: 1,
    borderColor: "#472126",
  },

  messageText: {
    color: "#F08A91",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
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
