import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { atualizarUsuario, buscarUsuario } from "@/services/usuarioService";

export default function EditarUsuarioScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [ativo, setAtivo] = useState(true);

  const [perfilId, setPerfilId] = useState("");
  const [perfilNome, setPerfilNome] = useState("");

  const [perfis, setPerfis] = useState<any[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setMensagem("");
      setCarregando(true);

      const [usuario, perfisResposta] = await Promise.all([
        buscarUsuario(id),
        listarPerfis(),
      ]);

      setUsername(usuario.username ?? "");

      setAtivo(usuario.ativo ?? true);

      setPerfilId(usuario.perfilId != null ? String(usuario.perfilId) : "");

      const perfilSelecionado = perfisResposta.find(
        (perfil: any) => String(perfil.id) === String(usuario.perfilId),
      );

      setPerfilNome(perfilSelecionado?.nome ?? "");

      setPerfis(perfisResposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar usuário.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function salvar() {
    if (!username.trim()) {
      Alert.alert("Atenção", "Informe o nome de usuário.");
      return;
    }

    if (username.trim().length > 50) {
      Alert.alert(
        "Atenção",
        "O nome de usuário deve ter no máximo 50 caracteres.",
      );
      return;
    }

    if (password && password.length < 6) {
      Alert.alert("Atenção", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!perfilId) {
      Alert.alert("Atenção", "Selecione o perfil.");
      return;
    }

    try {
      setSalvando(true);

      const dados: any = {
        username: username.trim(),
        ativo,
        perfilId: Number(perfilId),
      };

      // Senha é opcional na atualização.
      // Se estiver vazia, mantém a senha atual.
      if (password.trim()) {
        dados.password = password;
      }

      await atualizarUsuario(id, dados);

      Alert.alert("Sucesso", "Usuário atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/usuarios"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o usuário.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="USUARIO_EDITAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="USUARIO_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando usuário...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="USUARIO_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar usuário",
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
              <Text style={styles.titulo}>Editar usuário</Text>

              <Text style={styles.subtitulo}>Atualize os dados do usuário</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>👤</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados do usuário</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações de acesso e perfil
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome de usuário *</Text>

              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nome de usuário"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
              />

              <Text style={styles.label}>Nova senha</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Deixe vazio para manter a senha atual"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

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

            <Permissao permissao="USUARIO_EDITAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.botaoTexto}>Salvar alterações</Text>
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

  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },

  carregandoTexto: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 15,
  },

  erroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f6f8",
  },

  erroTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },

  erro: {
    fontSize: 16,
    textAlign: "center",
    color: "#111827",
  },
});
