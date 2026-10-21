import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import { ativarLicenca } from "@/services/licencaService";

export default function LicencaAtivacaoScreen() {
  const router = useRouter();
  const { mensagem: mensagemInicial } = useLocalSearchParams<{
    mensagem?: string;
  }>();

  const [token, setToken] = useState("");
  const [mensagem, setMensagem] = useState(mensagemInicial ?? "");
  const [erro, setErro] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [licencaAtivada, setLicencaAtivada] = useState(false);

  useEffect(() => {
    if (mensagemInicial) {
      setMensagem(mensagemInicial);
    }
  }, [mensagemInicial]);

  async function ativar() {
    if (!token.trim()) {
      setErro("Informe o token de ativação.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setCarregando(true);

      const resposta = await ativarLicenca(token);

      setMensagem(resposta.mensagem || "Licença ativada com sucesso!");
      setDataExpiracao(resposta.dataExpiracao || "");
      setLicencaAtivada(true);
      setToken("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível ativar a licença.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(data: string) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cabecalho}>
          <Text style={styles.logo}>BLACKBELT</Text>
          <Text style={styles.subtitulo}>
            Gestão inteligente para academias
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.titulo}>Ativação do BlackBelt</Text>

          {licencaAtivada ? (
            <>
              <Text style={styles.sucesso}>{mensagem}</Text>

              {dataExpiracao ? (
                <Text style={styles.texto}>
                  Sua licença é válida até{" "}
                  <Text style={styles.destaque}>
                    {formatarData(dataExpiracao)}
                  </Text>
                  .
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.botao}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.textoBotao}>ACESSAR O BLACKBELT</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.texto}>
                O período de avaliação terminou ou não há uma licença comercial
                válida. Informe seu token de ativação para continuar utilizando
                o sistema.
              </Text>

              {mensagem ? <Text style={styles.aviso}>{mensagem}</Text> : null}

              <Text style={styles.label}>Token de ativação</Text>

              <TextInput
                style={styles.input}
                value={token}
                onChangeText={setToken}
                placeholder="Cole seu token aqui"
                placeholderTextColor="#777777"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
              />

              {erro ? <Text style={styles.erro}>{erro}</Text> : null}

              <TouchableOpacity
                style={[styles.botao, carregando && styles.botaoDesabilitado]}
                onPress={ativar}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.textoBotao}>ATIVAR LICENÇA</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingVertical: 40,
  },
  cabecalho: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
  },
  subtitulo: {
    color: "#888888",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#151515",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#292929",
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 18,
  },
  texto: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 22,
  },
  label: {
    color: "#CCCCCC",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 16,
  },
  botao: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sucesso: {
    color: "#6EE7A0",
    fontSize: 15,
    marginBottom: 18,
  },
  aviso: {
    color: "#FBBF24",
    fontSize: 14,
    marginBottom: 18,
  },
  erro: {
    color: "#F08A91",
    backgroundColor: "#211315",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  destaque: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
