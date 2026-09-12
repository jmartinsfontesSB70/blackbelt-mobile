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
          <ActivityIndicator color="#C1121F" size="large" />

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
              <Text style={styles.label}>E-mail</Text>

              <Text style={styles.valor}>
                {usuario.email || "Não informado"}
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
                    <ActivityIndicator color="#C1121F" />
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
    backgroundColor: "#0A0A0A",
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
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarTexto: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  cabecalhoInfo: {
    flex: 1,
  },

  nome: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 7,
  },

  status: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusAtivo: {
    backgroundColor: "#17351F",
  },

  statusInativo: {
    backgroundColor: "#351719",
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },

  statusTextoAtivo: {
    color: "#6EE7A0",
  },

  statusTextoInativo: {
    color: "#F08A91",
  },

  avisoProtegido: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#302814",
    borderWidth: 1,
    borderColor: "#6B5518",
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
    color: "#FCD34D",
    marginBottom: 3,
  },

  avisoTexto: {
    fontSize: 12,
    color: "#FCD34D",
    lineHeight: 17,
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#242424",
  },

  secao: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  campo: {
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
    paddingVertical: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888888",
    marginBottom: 4,
  },

  valor: {
    fontSize: 16,
    color: "#CCCCCC",
  },

  valorAtivo: {
    color: "#6EE7A0",
    fontWeight: "600",
  },

  valorInativo: {
    color: "#F08A91",
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
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoEditarTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoExcluir: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#7F1D1D",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoExcluirTexto: {
    color: "#F08A91",
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

  rodape: {
    textAlign: "center",
    marginTop: 8,
    color: "#555555",
    fontSize: 13,
  },
});
