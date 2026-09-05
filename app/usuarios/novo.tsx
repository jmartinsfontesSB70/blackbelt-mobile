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

                <View>
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
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Senha *</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo de 6 caracteres"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {carregandoOpcoes ? (
                <View style={styles.carregandoOpcoes}>
                  <ActivityIndicator />

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
                  <ActivityIndicator color="#ffffff" />
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
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },

  botaoStatusAtivo: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },

  botaoStatusInativo: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },

  botaoStatusTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  botaoStatusTextoAtivo: {
    color: "#166534",
  },

  botaoStatusTextoInativo: {
    color: "#991b1b",
  },

  carregandoOpcoes: {
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  carregandoOpcoesTexto: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 13,
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
