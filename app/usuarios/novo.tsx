import { Stack, useRouter } from "expo-router";
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
import SelectInput from "@/components/SelectInput";

import { listarPerfis } from "@/services/perfilService";
import { criarUsuario } from "@/services/usuarioService";

export default function NovoUsuarioScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [perfilId, setPerfilId] = useState("");
  const [perfilNome, setPerfilNome] = useState("");

  const [ativo, setAtivo] = useState(true);

  const [perfis, setPerfis] = useState<any[]>([]);

  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarOpcoes();
  }, []);

  async function carregarOpcoes() {
    try {
      setCarregandoOpcoes(true);

      const perfisResposta = await listarPerfis();

      setPerfis(perfisResposta);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível carregar os perfis.");
      }
    } finally {
      setCarregandoOpcoes(false);
    }
  }

  async function salvar() {
    if (!username.trim()) {
      Alert.alert("Atenção", "Informe o nome do usuário.");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Atenção", "Informe o e-mail.");
      return;
    }

    if (!password) {
      Alert.alert("Atenção", "Informe a senha.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Atenção", "A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (!perfilId) {
      Alert.alert("Atenção", "Selecione o perfil.");
      return;
    }

    try {
      setSalvando(true);

      await criarUsuario({
        username: username.trim(),
        email: email.trim(),
        password,
        ativo,
        perfilId: Number(perfilId),
      });

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/usuarios"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar o usuário.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <RotaPermissao permissao="USUARIO_CRIAR">
      <>
        <Stack.Screen
          options={{
            title: "Novo usuário",
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
              <Text style={styles.titulo}>Novo usuário</Text>

              <Text style={styles.subtitulo}>
                Cadastre um novo usuário no BlackBelt
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>👤</Text>
                </View>

                <View style={styles.tituloSecaoInfo}>
                  <Text style={styles.secao}>Dados do usuário</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações de acesso ao sistema
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Usuário *</Text>

              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Ex.: joao"
                placeholderTextColor="#777777"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
              />

              <Text style={styles.label}>E-mail *</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Ex.: joao@email.com"
                placeholderTextColor="#777777"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                editable={!salvando}
              />

              <Text style={styles.label}>Senha *</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo de 6 caracteres"
                placeholderTextColor="#777777"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
              />

              {carregandoOpcoes ? (
                <View style={styles.carregandoOpcoes}>
                  <ActivityIndicator color="#C1121F" />

                  <Text style={styles.carregandoOpcoesTexto}>
                    Carregando perfis...
                  </Text>
                </View>
              ) : (
                <SelectInput
                  label="Perfil *"
                  value={perfilNome}
                  placeholder="Selecione o perfil"
                  options={perfis}
                  selectedId={perfilId}
                  onSelect={(item) => {
                    setPerfilId(String(item.id));
                    setPerfilNome(item.nome);
                  }}
                />
              )}

              <Text style={styles.label}>Situação</Text>

              <View style={styles.linhaStatus}>
                <TouchableOpacity
                  style={[styles.botaoStatus, ativo && styles.botaoStatusAtivo]}
                  onPress={() => setAtivo(true)}
                  disabled={salvando}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      ativo && styles.botaoStatusTextoAtivo,
                    ]}
                  >
                    Ativo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.botaoStatus,
                    !ativo && styles.botaoStatusInativo,
                  ]}
                  onPress={() => setAtivo(false)}
                  disabled={salvando}
                >
                  <Text
                    style={[
                      styles.botaoStatusTexto,
                      !ativo && styles.botaoStatusTextoInativo,
                    ]}
                  >
                    Inativo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Permissao permissao="USUARIO_CRIAR" esconder>
              <TouchableOpacity
                style={[
                  styles.botao,
                  (salvando || carregandoOpcoes) && styles.botaoDesabilitado,
                ]}
                onPress={salvar}
                disabled={salvando || carregandoOpcoes}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoTexto}>Cadastrar usuário</Text>
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
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconeTexto: {
    fontSize: 20,
  },

  tituloSecaoInfo: {
    flex: 1,
  },

  secao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  descricaoSecao: {
    fontSize: 12,
    color: "#777777",
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

  botaoStatusAtivo: {
    backgroundColor: "#17351F",
    borderColor: "#2D6A3D",
  },

  botaoStatusInativo: {
    backgroundColor: "#351719",
    borderColor: "#7F1D1D",
  },

  botaoStatusTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777777",
  },

  botaoStatusTextoAtivo: {
    color: "#6EE7A0",
  },

  botaoStatusTextoInativo: {
    color: "#F08A91",
  },

  carregandoOpcoes: {
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  carregandoOpcoesTexto: {
    marginTop: 8,
    color: "#888888",
    fontSize: 13,
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
});
