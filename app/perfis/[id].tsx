import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

import { buscarPerfil, excluirPerfil } from "@/services/perfilService";

type Permissao = {
  id: number;
  nome: string;
};

type Perfil = {
  id: number;
  nome: string;
  permissoes: Permissao[];
};

export default function PerfilDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, [id]);

  async function carregarPerfil() {
    try {
      setMensagem("");

      const resposta = await buscarPerfil(id);

      setPerfil(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar perfil.");
      }
    }
  }

  function perfilProtegido() {
    return perfil?.nome?.toLowerCase() === "admin";
  }

  function confirmarExclusao() {
    if (!perfil) {
      return;
    }

    if (perfilProtegido()) {
      Alert.alert(
        "Perfil protegido",
        "O perfil ADMIN é protegido e não pode ser excluído.",
      );

      return;
    }

    Alert.alert(
      "Excluir perfil",
      `Deseja realmente excluir o perfil "${perfil.nome}"?`,
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
    if (perfilProtegido()) {
      Alert.alert(
        "Perfil protegido",
        "O perfil ADMIN é protegido e não pode ser excluído.",
      );

      return;
    }

    try {
      setExcluindo(true);

      await excluirPerfil(Number(id));

      Alert.alert("Sucesso", "Perfil excluído com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/perfis"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir o perfil.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  const permissoesAgrupadas = useMemo(() => {
    if (!perfil) {
      return [];
    }

    const grupos: Record<string, Permissao[]> = {};

    perfil.permissoes.forEach((permissao) => {
      const [grupo] = permissao.nome.split("_");

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }

      grupos[grupo].push(permissao);
    });

    return Object.entries(grupos);
  }, [perfil]);

  if (mensagem) {
    return (
      <RotaPermissao permissao="PERFIL_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!perfil) {
    return (
      <RotaPermissao permissao="PERFIL_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" />

          <Text style={styles.carregandoTexto}>Carregando perfil...</Text>
        </View>
      </RotaPermissao>
    );
  }

  const protegido = perfilProtegido();

  return (
    <RotaPermissao permissao="PERFIL_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: perfil.nome,
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
              <Text style={styles.avatarTexto}>🔐</Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>{perfil.nome}</Text>

              <View style={styles.status}>
                <Text style={styles.statusTexto}>
                  {perfil.permissoes.length}{" "}
                  {perfil.permissoes.length === 1 ? "permissão" : "permissões"}
                </Text>
              </View>
            </View>
          </View>

          {/* Aviso de proteção */}

          {protegido && (
            <View style={styles.avisoProtegido}>
              <Text style={styles.avisoIcone}>🔒</Text>

              <View style={styles.avisoConteudo}>
                <Text style={styles.avisoTitulo}>Perfil protegido</Text>

                <Text style={styles.avisoTexto}>
                  O perfil ADMIN é protegido e não pode ser alterado ou
                  excluído.
                </Text>
              </View>
            </View>
          )}

          {/* Dados do perfil */}

          <View style={styles.card}>
            <Text style={styles.secao}>Dados do perfil</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Nome</Text>

              <Text style={styles.valor}>{perfil.nome}</Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Total de permissões</Text>

              <Text style={styles.valor}>{perfil.permissoes.length}</Text>
            </View>
          </View>

          {/* Permissões */}

          <View style={styles.card}>
            <View style={styles.tituloPermissoes}>
              <View>
                <Text style={styles.secao}>Permissões atribuídas</Text>

                <Text style={styles.descricaoSecao}>
                  Permissões concedidas a este perfil
                </Text>
              </View>
            </View>

            {perfil.permissoes.length === 0 ? (
              <Text style={styles.vazio}>Nenhuma permissão atribuída.</Text>
            ) : (
              permissoesAgrupadas.map(([grupo, permissoes]) => (
                <View key={grupo} style={styles.grupo}>
                  <View style={styles.grupoCabecalho}>
                    <Text style={styles.grupoNome}>{grupo}</Text>

                    <Text style={styles.grupoQuantidade}>
                      {permissoes.length}
                    </Text>
                  </View>

                  {permissoes.map((permissao) => (
                    <View key={permissao.id} style={styles.permissao}>
                      <View style={styles.check}>
                        <Text style={styles.checkTexto}>✓</Text>
                      </View>

                      <Text style={styles.permissaoNome}>
                        {formatarPermissao(permissao.nome)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>

          {/* Ações */}

          {!protegido && (
            <View style={styles.acoes}>
              <Permissao permissao="PERFIL_EDITAR" esconder>
                <Pressable
                  style={styles.botaoEditar}
                  onPress={() => router.push(`/perfis/editar/${id}`)}
                  disabled={excluindo}
                >
                  <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
                </Pressable>
              </Permissao>

              <Permissao permissao="PERFIL_EXCLUIR" esconder>
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

function formatarPermissao(nome: string) {
  return nome
    .split("_")
    .slice(1)
    .join(" ")
    .toLowerCase()
    .replace(/^\w/, (letra) => letra.toUpperCase());
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
    fontSize: 28,
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
    backgroundColor: "#e0e7ff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusTexto: {
    color: "#3730a3",
    fontSize: 11,
    fontWeight: "bold",
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

  descricaoSecao: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },

  tituloPermissoes: {
    marginBottom: 4,
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

  grupo: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },

  grupoCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  grupoNome: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },

  grupoQuantidade: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#4b5563",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  permissao: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },

  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  permissaoNome: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },

  vazio: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
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
