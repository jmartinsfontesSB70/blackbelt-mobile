import { Stack, useRouter } from "expo-router";
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

import { criarPerfil } from "@/services/perfilService";
import { listarPermissoes } from "@/services/permissaoService";

type Permissao = {
  id: number;
  nome: string;
};

type GrupoPermissoes = {
  chave: string;
  titulo: string;
  permissoes: Permissao[];
};

const ORDEM_GRUPOS = [
  "ALUNO",
  "PROFESSOR",
  "MODALIDADE",
  "TURMA",
  "MATRICULA",
  "PRESENCA",
  "PERFIL",
  "USUARIO",
];

const TITULOS_GRUPOS: Record<string, string> = {
  ALUNO: "Alunos",
  PROFESSOR: "Professores",
  MODALIDADE: "Modalidades",
  TURMA: "Turmas",
  MATRICULA: "Matrículas",
  PRESENCA: "Presenças",
  PERFIL: "Perfis",
  USUARIO: "Usuários",
};

const ORDEM_ACOES = ["LISTAR", "CRIAR", "EDITAR", "EXCLUIR"];

const TITULOS_ACOES: Record<string, string> = {
  LISTAR: "Listar",
  CRIAR: "Criar",
  EDITAR: "Editar",
  EXCLUIR: "Excluir",
};

export default function NovoPerfilScreen() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<
    number[]
  >([]);

  const [carregandoPermissoes, setCarregandoPermissoes] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarPermissoes() {
      try {
        setCarregandoPermissoes(true);

        const resposta = await listarPermissoes();

        setPermissoes(resposta);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert("Erro", error.message);
        } else {
          Alert.alert("Erro", "Não foi possível carregar as permissões.");
        }
      } finally {
        setCarregandoPermissoes(false);
      }
    }

    carregarPermissoes();
  }, []);

  const grupos = useMemo<GrupoPermissoes[]>(() => {
    const mapa = new Map<string, Permissao[]>();

    permissoes.forEach((permissao) => {
      const separador = permissao.nome.indexOf("_");

      if (separador === -1) {
        return;
      }

      const grupo = permissao.nome.substring(0, separador);

      if (!mapa.has(grupo)) {
        mapa.set(grupo, []);
      }

      mapa.get(grupo)!.push(permissao);
    });

    return Array.from(mapa.entries())
      .sort(([grupoA], [grupoB]) => {
        const indiceA = ORDEM_GRUPOS.indexOf(grupoA);
        const indiceB = ORDEM_GRUPOS.indexOf(grupoB);

        if (indiceA === -1 && indiceB === -1) {
          return grupoA.localeCompare(grupoB);
        }

        if (indiceA === -1) {
          return 1;
        }

        if (indiceB === -1) {
          return -1;
        }

        return indiceA - indiceB;
      })
      .map(([chave, permissoesGrupo]) => ({
        chave,
        titulo: TITULOS_GRUPOS[chave] ?? chave,
        permissoes: permissoesGrupo.sort((a, b) => {
          const acaoA = a.nome.substring(a.nome.indexOf("_") + 1);
          const acaoB = b.nome.substring(b.nome.indexOf("_") + 1);

          const indiceA = ORDEM_ACOES.indexOf(acaoA);
          const indiceB = ORDEM_ACOES.indexOf(acaoB);

          if (indiceA === -1 && indiceB === -1) {
            return a.nome.localeCompare(b.nome);
          }

          if (indiceA === -1) {
            return 1;
          }

          if (indiceB === -1) {
            return -1;
          }

          return indiceA - indiceB;
        }),
      }));
  }, [permissoes]);

  const todasSelecionadas =
    permissoes.length > 0 &&
    permissoes.every((permissao) =>
      permissoesSelecionadas.includes(permissao.id),
    );

  function alternarPermissao(id: number) {
    setPermissoesSelecionadas((atuais) => {
      if (atuais.includes(id)) {
        return atuais.filter((permissaoId) => permissaoId !== id);
      }

      return [...atuais, id];
    });
  }

  function alternarGrupo(grupo: GrupoPermissoes) {
    const idsGrupo = grupo.permissoes.map((permissao) => permissao.id);

    const grupoSelecionado = idsGrupo.every((id) =>
      permissoesSelecionadas.includes(id),
    );

    setPermissoesSelecionadas((atuais) => {
      if (grupoSelecionado) {
        return atuais.filter((id) => !idsGrupo.includes(id));
      }

      return Array.from(new Set([...atuais, ...idsGrupo]));
    });
  }

  function alternarTodas() {
    if (todasSelecionadas) {
      setPermissoesSelecionadas([]);
      return;
    }

    setPermissoesSelecionadas(permissoes.map((permissao) => permissao.id));
  }

  function grupoEstaCompleto(grupo: GrupoPermissoes) {
    return (
      grupo.permissoes.length > 0 &&
      grupo.permissoes.every((permissao) =>
        permissoesSelecionadas.includes(permissao.id),
      )
    );
  }

  function grupoEstaParcial(grupo: GrupoPermissoes) {
    const quantidadeSelecionada = grupo.permissoes.filter((permissao) =>
      permissoesSelecionadas.includes(permissao.id),
    ).length;

    return (
      quantidadeSelecionada > 0 &&
      quantidadeSelecionada < grupo.permissoes.length
    );
  }

  function nomeAcao(permissao: Permissao) {
    const separador = permissao.nome.indexOf("_");

    if (separador === -1) {
      return permissao.nome;
    }

    const acao = permissao.nome.substring(separador + 1);

    return TITULOS_ACOES[acao] ?? acao;
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do perfil.");
      return;
    }

    try {
      setSalvando(true);

      await criarPerfil({
        nome: nome.trim(),
        permissaoIds: permissoesSelecionadas,
      });

      Alert.alert("Sucesso", "Perfil cadastrado com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/perfis"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível cadastrar o perfil.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Novo perfil",
        }}
      />

      <RotaPermissao permissao="PERFIL_CRIAR">
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
              <Text style={styles.titulo}>Novo perfil</Text>

              <Text style={styles.subtitulo}>
                Cadastre um novo perfil no BlackBelt
              </Text>
            </View>

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

            <View style={styles.card}>
              <View style={styles.tituloSecao}>
                <View style={styles.iconeSecao}>
                  <Text style={styles.iconeTexto}>🛡️</Text>
                </View>

                <View style={styles.tituloSecaoTexto}>
                  <Text style={styles.secao}>Permissões</Text>

                  <Text style={styles.descricaoSecao}>
                    Selecione as permissões deste perfil
                  </Text>
                </View>
              </View>

              {!carregandoPermissoes && permissoes.length > 0 && (
                <TouchableOpacity
                  style={styles.selecionarTodas}
                  onPress={alternarTodas}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      todasSelecionadas && styles.checkboxSelecionado,
                    ]}
                  >
                    {todasSelecionadas ? (
                      <Text style={styles.check}>✓</Text>
                    ) : null}
                  </View>

                  <Text style={styles.selecionarTodasTexto}>
                    {todasSelecionadas
                      ? "Desmarcar todas"
                      : "Selecionar todas as permissões"}
                  </Text>
                </TouchableOpacity>
              )}

              {carregandoPermissoes ? (
                <ActivityIndicator color="#C1121F" style={styles.carregando} />
              ) : grupos.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma permissão encontrada.</Text>
              ) : (
                grupos.map((grupo) => {
                  const completo = grupoEstaCompleto(grupo);
                  const parcial = grupoEstaParcial(grupo);

                  return (
                    <View key={grupo.chave} style={styles.grupo}>
                      <View style={styles.grupoCabecalho}>
                        <View>
                          <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>

                          <Text style={styles.grupoSubtitulo}>
                            {grupo.permissoes.length} permissões
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.botaoGrupo}
                          onPress={() => alternarGrupo(grupo)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.botaoGrupoTexto}>
                            {completo ? "Desmarcar todas" : "Selecionar todas"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.acoes}>
                        {grupo.permissoes.map((permissao) => {
                          const selecionada = permissoesSelecionadas.includes(
                            permissao.id,
                          );

                          return (
                            <TouchableOpacity
                              key={permissao.id}
                              style={styles.acao}
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

                              <Text style={styles.acaoTexto}>
                                {nomeAcao(permissao)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {parcial && (
                        <Text style={styles.parcial}>
                          Algumas permissões deste grupo estão selecionadas.
                        </Text>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.resumo}>
              <Text style={styles.resumoTexto}>
                {permissoesSelecionadas.length} de {permissoes.length}{" "}
                permissões selecionadas
              </Text>
            </View>

            <RotaPermissao permissao="PERFIL_CRIAR">
              <TouchableOpacity
                style={[styles.botao, salvando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={salvando || carregandoPermissoes}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoTexto}>Cadastrar perfil</Text>
                )}
              </TouchableOpacity>
            </RotaPermissao>

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
      </RotaPermissao>
    </>
  );
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

  tituloSecaoTexto: {
    flex: 1,
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

  selecionarTodas: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 16,
  },

  selecionarTodasTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  grupo: {
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#151515",
  },

  grupoCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#0D0D0D",
  },

  grupoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  grupoSubtitulo: {
    fontSize: 11,
    color: "#777777",
    marginTop: 2,
  },

  botaoGrupo: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  botaoGrupoTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#C1121F",
  },

  acoes: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  acao: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  acaoTexto: {
    fontSize: 14,
    color: "#CCCCCC",
  },

  parcial: {
    fontSize: 11,
    color: "#888888",
    paddingHorizontal: 14,
    paddingBottom: 12,
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

  carregando: {
    marginVertical: 20,
  },

  vazio: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },

  resumo: {
    alignItems: "center",
    marginBottom: 10,
  },

  resumoTexto: {
    fontSize: 13,
    color: "#888888",
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
});
