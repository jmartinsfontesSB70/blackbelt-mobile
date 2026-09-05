import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { buscarUsuario, excluirUsuario } from "@/services/usuarioService";

export default function UsuarioDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [usuario, setUsuario] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarUsuario();
  }, [id]);

  async function carregarUsuario() {
    try {
      setMensagem("");

      const resposta = await buscarUsuario(id);

      setUsuario(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar usuário.");
      }
    }
  }

  function usuarioProtegido() {
    return usuario?.username?.toLowerCase() === "admin";
  }

  function confirmarExclusao() {
    if (!usuario) {
      return;
    }

    if (usuarioProtegido()) {
      Alert.alert(
        "Usuário protegido",
        "O usuário admin é protegido e não pode ser excluído.",
      );

      return;
    }

    Alert.alert(
      "Excluir usuário",
      `Deseja realmente excluir o usuário "${usuario.username}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: executarExclusao,
        },
      ],
    );
  }

  async function executarExclusao() {
    if (usuarioProtegido()) {
      Alert.alert(
        "Usuário protegido",
        "O usuário admin é protegido e não pode ser excluído.",
      );

      return;
    }

    try {
      setExcluindo(true);

      await excluirUsuario(Number(id));

      Alert.alert("Sucesso", "Usuário excluído com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/usuarios"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir o usuário.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="USUARIO_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!usuario) {
    return (
      <RotaPermissao permissao="USUARIO_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando usuário...</Text>
        </View>
      </RotaPermissao>
    );
  }

  const protegido = usuarioProtegido();

  return (
    <RotaPermissao permissao="USUARIO_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: "Usuário",
          }}
        />

        <ScrollView
          style={styles.tela}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}

          <View style={styles.cabecalho}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {usuario.username?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>
                {usuario.username || "Usuário não informado"}
              </Text>

              <View
                style={[
                  styles.status,
                  usuario.ativo ? styles.statusAtivo : styles.statusInativo,
                ]}
              >
                <Text
                  style={[
                    styles.statusTexto,
                    usuario.ativo
                      ? styles.statusTextoAtivo
                      : styles.statusTextoInativo,
                  ]}
                >
                  {usuario.ativo ? "ATIVO" : "INATIVO"}
                </Text>
              </View>
            </View>
          </View>

          {/* Aviso de proteção */}

          {protegido && (
            <View style={styles.avisoProtegido}>
              <Text style={styles.avisoIcone}>🔒</Text>

              <View style={styles.avisoConteudo}>
                <Text style={styles.avisoTitulo}>Usuário protegido</Text>

                <Text style={styles.avisoTexto}>
                  O usuário admin é protegido e não pode ser alterado ou
                  excluído.
                </Text>
              </View>
            </View>
          )}

          {/* Dados do usuário */}

          <View style={styles.card}>
            <Text style={styles.secao}>Dados do usuário</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Nome de usuário</Text>

              <Text style={styles.valor}>
                {usuario.username || "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Perfil</Text>

              <Text style={styles.valor}>
                {usuario.perfilNome || "Não informado"}
              </Text>
            </View>
          </View>

          {/* Situação */}

          <View style={styles.card}>
            <Text style={styles.secao}>Situação</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Status do usuário</Text>

              <Text
                style={[
                  styles.valor,
                  usuario.ativo ? styles.valorAtivo : styles.valorInativo,
                ]}
              >
                {usuario.ativo ? "Ativo" : "Inativo"}
              </Text>
            </View>
          </View>

          {/* Ações */}

          {!protegido && (
            <View style={styles.acoes}>
              <Permissao permissao="USUARIO_EDITAR" esconder>
                <Pressable
                  style={styles.botaoEditar}
                  onPress={() =>
                    router.push({
                      pathname: "/usuarios/editar/[id]",
                      params: {
                        id: String(id),
                      },
                    })
                  }
                  disabled={excluindo}
                >
                  <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
                </Pressable>
              </Permissao>

              <Permissao permissao="USUARIO_EXCLUIR" esconder>
                <Pressable
                  style={[
                    styles.botaoExcluir,
                    excluindo && styles.botaoDesabilitado,
                  ]}
                  onPress={confirmarExclusao}
                  disabled={excluindo}
                >
                  {excluindo ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.botaoExcluirTexto}>🗑️ Excluir</Text>
                  )}
                </Pressable>
              </Permissao>
            </View>
          )}

          <Text style={styles.rodape}>BlackBelt</Text>
        </ScrollView>
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
    paddingBottom: 40,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarTexto: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
  },

  cabecalhoInfo: {
    flex: 1,
  },

  nome: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 7,
  },

  status: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusAtivo: {
    backgroundColor: "#dcfce7",
  },

  statusInativo: {
    backgroundColor: "#fee2e2",
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },

  statusTextoAtivo: {
    color: "#166534",
  },

  statusTextoInativo: {
    color: "#991b1b",
  },

  avisoProtegido: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  avisoIcone: {
    fontSize: 22,
    marginRight: 12,
  },

  avisoConteudo: {
    flex: 1,
  },

  avisoTitulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 3,
  },

  avisoTexto: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 17,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
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

  secao: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },

  campo: {
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },

  valor: {
    fontSize: 16,
    color: "#111827",
  },

  valorAtivo: {
    color: "#166534",
    fontWeight: "600",
  },

  valorInativo: {
    color: "#991b1b",
    fontWeight: "600",
  },

  acoes: {
    marginTop: 4,
    marginBottom: 20,
    gap: 10,
  },

  botaoEditar: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoEditarTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoExcluir: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoExcluirTexto: {
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.6,
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
    color: "#6b7280",
  },

  rodape: {
    textAlign: "center",
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 13,
  },
});
