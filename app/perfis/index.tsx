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

import { listarPerfis } from "@/services/perfilService";

export default function PerfisScreen() {
  const router = useRouter();

  const [perfis, setPerfis] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarPerfis = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarPerfis();

      setPerfis(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar perfis.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPerfis();
    }, [carregarPerfis]),
  );

  return (
    <RotaPermissao permissao="PERFIL_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.titulo}>Perfis</Text>

            <Text style={styles.subtitulo}>
              Gerencie os perfis e suas permissões
            </Text>
          </View>

          <Permissao permissao="PERFIL_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/perfis/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Novo</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <View style={styles.erroContainer}>
            <Text style={styles.erroTitulo}>Ops!</Text>

            <Text style={styles.mensagem}>{mensagem}</Text>
          </View>
        ) : (
          <FlatList
            data={perfis}
            keyExtractor={(perfil) => perfil.id.toString()}
            renderItem={({ item }) => {
              const quantidadePermissoes = item.permissoes?.length ?? 0;

              return (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push(`/perfis/${item.id}`)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardCabecalho}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTexto}>
                        {item.nome?.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.info}>
                      <Text style={styles.nome} numberOfLines={1}>
                        {item.nome}
                      </Text>

                      <Text style={styles.identificacao}>Perfil de acesso</Text>
                    </View>

                    <Text style={styles.seta}>›</Text>
                  </View>

                  <View style={styles.divisor} />

                  <View style={styles.rodapeCard}>
                    <View style={styles.permissoesBadge}>
                      <Text style={styles.permissoesIcone}>🛡️</Text>

                      <Text style={styles.permissoesTexto}>
                        {quantidadePermissoes}{" "}
                        {quantidadePermissoes === 1
                          ? "permissão"
                          : "permissões"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              !carregando ? (
                <View style={styles.vazioContainer}>
                  <Text style={styles.vazioIcone}>🔐</Text>

                  <Text style={styles.vazioTitulo}>
                    Nenhum perfil encontrado
                  </Text>

                  <Text style={styles.vazio}>
                    Cadastre um perfil para começar.
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              carregando ? (
                <ActivityIndicator size="small" style={styles.carregando} />
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lista}
          />
        )}
      </View>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#f5f6f8",
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitulo: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },

  botaoNovo: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },

  botaoNovoTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  lista: {
    paddingBottom: 30,
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
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  avatarTexto: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    flex: 1,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  identificacao: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },

  seta: {
    fontSize: 30,
    fontWeight: "300",
    color: "#9ca3af",
    marginLeft: 8,
  },

  divisor: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },

  rodapeCard: {
    flexDirection: "row",
    alignItems: "center",
  },

  permissoesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  permissoesIcone: {
    fontSize: 13,
    marginRight: 6,
  },

  permissoesTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },

  carregando: {
    marginVertical: 20,
  },

  erroContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  erroTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },

  mensagem: {
    color: "#b91c1c",
    fontSize: 15,
    textAlign: "center",
  },

  vazioContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  vazioIcone: {
    fontSize: 36,
    marginBottom: 12,
  },

  vazioTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },

  vazio: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
});
