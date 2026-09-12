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

                    <Text style={styles.email}>
                      {item.email || "E-mail não informado"}
                    </Text>

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
                <ActivityIndicator color="#C1121F" style={styles.carregando} />
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
    backgroundColor: "#0A0A0A",
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
    color: "#FFFFFF",
  },

  botaoNovo: {
    backgroundColor: "#C1121F",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  botaoNovoTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#242424",
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
    backgroundColor: "#C1121F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarTexto: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  cardCabecalhoInfo: {
    flex: 1,
  },

  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  email: {
    fontSize: 13,
    color: "#888888",
    marginBottom: 8,
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

  dados: {
    borderTopWidth: 1,
    borderTopColor: "#242424",
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
    fontSize: 15,
    color: "#CCCCCC",
  },

  mensagem: {
    color: "#F08A91",
    fontSize: 15,
  },

  vazio: {
    color: "#888888",
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },

  carregando: {
    marginVertical: 20,
  },
});
