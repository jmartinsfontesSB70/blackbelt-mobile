import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { listarUsuarios } from "@/services/usuarioService";

export default function UsuariosScreen() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarUsuarios();

      setUsuarios(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar usuários.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [carregarUsuarios]),
  );

  return (
    <RotaPermissao permissao="USUARIO_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Usuários</Text>

          <Permissao permissao="USUARIO_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/usuarios/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Novo usuário</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={usuarios}
            keyExtractor={(usuario) => usuario.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/usuarios/${item.id}`)}
              >
                <View style={styles.cardCabecalho}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>
                      {item.username?.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.cardCabecalhoInfo}>
                    <Text style={styles.username}>{item.username}</Text>

                    <View
                      style={[
                        styles.status,
                        item.ativo ? styles.statusAtivo : styles.statusInativo,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTexto,
                          item.ativo
                            ? styles.statusTextoAtivo
                            : styles.statusTextoInativo,
                        ]}
                      >
                        {item.ativo ? "ATIVO" : "INATIVO"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.dados}>
                  <View style={styles.campo}>
                    <Text style={styles.label}>Perfil</Text>

                    <Text style={styles.valor}>
                      {item.perfilNome || "Não informado"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              !carregando ? (
                <Text style={styles.vazio}>Nenhum usuário encontrado.</Text>
              ) : null
            }
            ListFooterComponent={
              carregando ? (
                <ActivityIndicator style={styles.carregando} />
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#f5f6f8",
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  botaoNovo: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  botaoNovoTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  cardCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarTexto: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },

  cardCabecalhoInfo: {
    flex: 1,
  },

  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
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

  dados: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
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
    fontSize: 15,
    color: "#111827",
  },

  mensagem: {
    color: "#b91c1c",
    fontSize: 15,
  },

  vazio: {
    color: "#6b7280",
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },

  carregando: {
    marginVertical: 20,
  },
});
