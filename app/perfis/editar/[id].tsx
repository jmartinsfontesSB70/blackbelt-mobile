import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

import RotaPermissao from "@/components/RotaPermissao";
import { atualizarPerfil, buscarPerfil } from "@/services/perfilService";
import { listarPermissoes } from "@/services/permissaoService";

type Permissao = {
  id: number;
  nome: string;
};

type Perfil = {
  id: number;
  nome: string;
  permissoes: Permissao[];
};

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState("");

  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<
    number[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [perfil, todasPermissoes] = await Promise.all([
        buscarPerfil(id),
        listarPermissoes(),
      ]);

      const perfilCarregado = perfil as Perfil;

      setNome(perfilCarregado.nome);

      setPermissoes(todasPermissoes);

      setPermissoesSelecionadas(
        perfilCarregado.permissoes.map((permissao) => permissao.id),
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível carregar o perfil.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function alternarPermissao(idPermissao: number) {
    setPermissoesSelecionadas((atuais) => {
      if (atuais.includes(idPermissao)) {
        return atuais.filter((permissaoId) => permissaoId !== idPermissao);
      }

      return [...atuais, idPermissao];
    });
  }

  function selecionarTodas() {
    setPermissoesSelecionadas(permissoes.map((permissao) => permissao.id));
  }

  function limparTodas() {
    setPermissoesSelecionadas([]);
  }

  function todasSelecionadas() {
    return (
      permissoes.length > 0 &&
      permissoesSelecionadas.length === permissoes.length
    );
  }

  const permissoesAgrupadas = useMemo(() => {
    const grupos: Record<string, Permissao[]> = {};

    permissoes.forEach((permissao) => {
      const [grupo] = permissao.nome.split("_");

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }

      grupos[grupo].push(permissao);
    });

    return Object.entries(grupos);
  }, [permissoes]);

  function grupoSelecionado(grupoPermissoes: Permissao[]) {
    return (
      grupoPermissoes.length > 0 &&
      grupoPermissoes.every((permissao) =>
        permissoesSelecionadas.includes(permissao.id),
      )
    );
  }

  function alternarGrupo(grupoPermissoes: Permissao[]) {
    const todosSelecionados = grupoSelecionado(grupoPermissoes);

    setPermissoesSelecionadas((atuais) => {
      if (todosSelecionados) {
        const idsGrupo = grupoPermissoes.map((permissao) => permissao.id);

        return atuais.filter((idPermissao) => !idsGrupo.includes(idPermissao));
      }

      const novosIds = grupoPermissoes
        .map((permissao) => permissao.id)
        .filter((idPermissao) => !atuais.includes(idPermissao));

      return [...atuais, ...novosIds];
    });
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do perfil.");
      return;
    }

    try {
      setSalvando(true);

      await atualizarPerfil(id, {
        nome: nome.trim(),
        permissaoIds: permissoesSelecionadas,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/perfis"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o perfil.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <RotaPermissao permissao="PERFIL_EDITAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando perfil...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="PERFIL_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Editar perfil",
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
            {/* Cabeçalho */}

            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Editar perfil</Text>

              <Text style={styles.subtitulo}>
                Altere os dados e as permissões do perfil
              </Text>
            </View>

            {/* Dados do perfil */}

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🔐</Text>
                </View>

                <View>
                  <Text style={styles.secao}>Dados do perfil</Text>

                  <Text style={styles.descricaoSecao}>
                    Informações do perfil
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Nome do perfil *</Text>

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Administrador"
                placeholderTextColor="#777777"
                autoCapitalize="words"
              />
            </View>

            {/* Permissões */}

            <View style={styles.card}>
              <View style={styles.tituloPermissoes}>
                <View style={styles.tituloSecao}>
                  <View style={styles.iconeSecao}>
                    <Text style={styles.iconeTexto}>🛡️</Text>
                  </View>

                  <View>
                    <Text style={styles.secao}>Permissões</Text>

                    <Text style={styles.descricaoSecao}>
                      Selecione as permissões deste perfil
                    </Text>
                  </View>
                </View>

                {/* Ações gerais */}

                <View style={styles.acoesPermissoes}>
                  <TouchableOpacity
                    style={[
                      styles.botaoSelecao,
                      todasSelecionadas() && styles.botaoSelecaoAtivo,
                    ]}
                    onPress={
                      todasSelecionadas() ? limparTodas : selecionarTodas
                    }
                    disabled={permissoes.length === 0}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.botaoSelecaoTexto,
                        todasSelecionadas() && styles.botaoSelecaoTextoAtivo,
                      ]}
                    >
                      {todasSelecionadas()
                        ? "Desmarcar todas"
                        : "Selecionar todas"}
                    </Text>
                  </TouchableOpacity>

                  {permissoesSelecionadas.length > 0 &&
                    !todasSelecionadas() && (
                      <TouchableOpacity
                        style={styles.botaoLimpar}
                        onPress={limparTodas}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.botaoLimparTexto}>
                          Limpar seleção
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>

                {/* Contador */}

                <View style={styles.contador}>
                  <Text style={styles.contadorTexto}>
                    {permissoesSelecionadas.length} de {permissoes.length}{" "}
                    permissões selecionadas
                  </Text>
                </View>

                {/* Grupos */}

                {permissoes.length === 0 ? (
                  <Text style={styles.vazio}>
                    Nenhuma permissão encontrada.
                  </Text>
                ) : (
                  permissoesAgrupadas.map(([grupo, grupoPermissoes]) => {
                    const grupoTodosSelecionados =
                      grupoSelecionado(grupoPermissoes);

                    return (
                      <View key={grupo} style={styles.grupo}>
                        {/* Cabeçalho do grupo */}

                        <TouchableOpacity
                          style={styles.grupoCabecalho}
                          onPress={() => alternarGrupo(grupoPermissoes)}
                          activeOpacity={0.7}
                        >
                          <View>
                            <Text style={styles.grupoNome}>{grupo}</Text>

                            <Text style={styles.grupoDescricao}>
                              {
                                grupoPermissoes.filter((permissao) =>
                                  permissoesSelecionadas.includes(permissao.id),
                                ).length
                              }{" "}
                              de {grupoPermissoes.length} selecionadas
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.checkboxGrupo,
                              grupoTodosSelecionados &&
                                styles.checkboxSelecionado,
                            ]}
                          >
                            {grupoTodosSelecionados ? (
                              <Text style={styles.check}>✓</Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>

                        {/* Permissões do grupo */}

                        {grupoPermissoes.map((permissao) => {
                          const selecionada = permissoesSelecionadas.includes(
                            permissao.id,
                          );

                          return (
                            <TouchableOpacity
                              key={permissao.id}
                              style={styles.permissao}
                              onPress={() => alternarPermissao(permissao.id)}
                              activeOpacity={0.7}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  selecionada && styles.checkboxSelecionado,
                                ]}
                              >
                                {selecionada ? (
                                  <Text style={styles.check}>✓</Text>
                                ) : null}
                              </View>

                              <Text style={styles.permissaoNome}>
                                {formatarPermissao(permissao.nome)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Salvar */}

            <RotaPermissao permissao="PERFIL_EDITAR">
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
            </RotaPermissao>

            {/* Cancelar */}

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
    backgroundColor: "#0A0A0A",
  },

  container: {
    padding: 20,
    paddingBottom: 80,
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
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
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
    backgroundColor: "#0D0D0D",
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
    color: "#FFFFFF",
  },

  descricaoSecao: {
    fontSize: 12,
    color: "#888888",
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

  tituloPermissoes: {
    marginBottom: 2,
  },

  acoesPermissoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },

  botaoSelecao: {
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#0D0D0D",
  },

  botaoSelecaoAtivo: {
    backgroundColor: "#C1121F",
    borderColor: "#C1121F",
  },

  botaoSelecaoTexto: {
    color: "#CCCCCC",
    fontSize: 12,
    fontWeight: "600",
  },

  botaoSelecaoTextoAtivo: {
    color: "#FFFFFF",
  },

  botaoLimpar: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  botaoLimparTexto: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
  },

  contador: {
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
  },

  contadorTexto: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
  },

  grupo: {
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 12,
    marginTop: 12,
    overflow: "hidden",
    backgroundColor: "#151515",
  },

  grupoCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  grupoNome: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  grupoDescricao: {
    fontSize: 11,
    color: "#777777",
    marginTop: 2,
  },

  checkboxGrupo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#444444",
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },

  permissao: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#2B2B2B",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#444444",
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  checkboxSelecionado: {
    backgroundColor: "#C1121F",
    borderColor: "#C1121F",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  permissaoNome: {
    flex: 1,
    fontSize: 14,
    color: "#CCCCCC",
  },

  vazio: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
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
});
