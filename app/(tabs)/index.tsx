import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { fazerLogin } from "@/services/authService";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const router = useRouter();

  async function entrar() {
    try {
      setMensagem("");

      const resposta = await fazerLogin(username.trim(), password);

      setMensagem("Login realizado com sucesso! 🎉");

      router.push("/menu");
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro desconhecido.");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BLACKBELT</Text>

      <Text style={styles.subtitle}>Gestão para academias</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={entrar}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  logo: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  mensagem: {
    marginTop: 20,
    textAlign: "center",
  },
});
