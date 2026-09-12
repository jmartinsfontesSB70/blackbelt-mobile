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
  const [email, setEmail] = useState("");
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
      setEmail(usuario.email ?? "");

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

    if (!email.trim()) {
      Alert.alert("Atenção", "Informe o e-mail.");
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
        email: email.trim(),
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
          <ActivityIndicator color="#C1121F" size="large" />

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

                <View style={styles.tituloSecaoInfo}>
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
                placeholderTextColor="#777777"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
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

              <Text style={styles.label}>Nova senha</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Deixe vazio para manter a senha atual"
                placeholderTextColor="#777777"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!salvando}
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

            <Permissao permissao="USUARIO_EDITAR" esconder>
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
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

  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },

  carregandoTexto: {
    marginTop: 12,
    color: "#888888",
    fontSize: 15,
  },

  erroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0A0A0A",
  },

  erroTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },

  erro: {
    fontSize: 16,
    textAlign: "center",
    color: "#888888",
  },
});
