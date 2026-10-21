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

const TITULOS_GRUPOS: Record<string, string> = {
  ALUNO: "Alunos",
  PROFESSOR: "Professores",
  MODALIDADE: "Modalidades",
  TURMA: "Turmas",
  MATRICULA: "Matrículas",
  PRESENCA: "Presenças",
  PERFIL: "Perfis",
  USUARIO: "Usuários",
  COBRANCA: "Cobranças",
  TIPO_COBRANCA: "Tipos de cobrança",
  PAGAMENTO: "Pagamentos",
  ACADEMIA: "Academia",
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
  "COBRANCA",
  "TIPO_COBRANCA",
  "PAGAMENTO",
  "ACADEMIA",
];

const ORDEM_ACOES = [
  "LISTAR",
  "CRIAR",
  "CADASTRAR",
  "EDITAR",
  "CANCELAR",
  "EXCLUIR",
];

const TITULOS_ACOES: Record<string, string> = {
  LISTAR: "Listar",
  CRIAR: "Criar",
  CADASTRAR: "Cadastrar",
  EDITAR: "Editar",
  CANCELAR: "Cancelar",
  EXCLUIR: "Excluir",
};

function obterGrupoPermissao(nome: string) {
  if (nome.startsWith("TIPO_COBRANCA_")) {
    return "TIPO_COBRANCA";
  }

  const separador = nome.indexOf("_");

  if (separador === -1) {
    return null;
  }

  return nome.substring(0, separador);
}

function obterAcaoPermissao(nome: string, grupo: string) {
  const prefixo = `${grupo}_`;

  if (!nome.startsWith(prefixo)) {
    return nome;
  }

  return nome.substring(prefixo.length);
}

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
      const grupo = obterGrupoPermissao(permissao.nome);

      if (!grupo) {
        return;
      }

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }

      grupos[grupo].push(permissao);
    });

    return Object.entries(grupos)
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
      .map(
        ([grupo, permissoes]) =>
          [
            grupo,
            permissoes.sort((a, b) => {
              const acaoA = obterAcaoPermissao(a.nome, grupo);
              const acaoB = obterAcaoPermissao(b.nome, grupo);

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
          ] as [string, Permissao[]],
      );
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
          <ActivityIndicator size="large" color="#C1121F" />

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
                    <Text style={styles.grupoNome}>
                      {TITULOS_GRUPOS[grupo] ?? grupo}
                    </Text>

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
                    <ActivityIndicator color="#F08A91" />
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
  const grupo = obterGrupoPermissao(nome);

  if (!grupo) {
    return nome;
  }

  const acao = obterAcaoPermissao(nome, grupo);

  return TITULOS_ACOES[acao] ?? acao;
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
    fontSize: 28,
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
    backgroundColor: "#12351F",
    borderWidth: 1,
    borderColor: "#2A6B43",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  statusTexto: {
    color: "#75D89A",
    fontSize: 11,
    fontWeight: "bold",
  },

  avisoProtegido: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2110",
    borderWidth: 1,
    borderColor: "#6B5422",
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
    color: "#F0C96A",
    marginBottom: 3,
  },

  avisoTexto: {
    fontSize: 12,
    color: "#DDBF75",
    lineHeight: 17,
  },

  card: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    borderRadius: 16,
    padding: 20,
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

  secao: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  descricaoSecao: {
    fontSize: 13,
    color: "#888888",
    marginBottom: 12,
  },

  tituloPermissoes: {
    marginBottom: 4,
  },

  campo: {
    borderBottomWidth: 1,
    borderBottomColor: "#2B2B2B",
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
    color: "#FFFFFF",
  },

  grupo: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#151515",
  },

  grupoCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  grupoNome: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  grupoQuantidade: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#CCCCCC",
    backgroundColor: "#242424",
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
    borderTopColor: "#2B2B2B",
  },

  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkTexto: {
    color: "#FFFFFF",
    fontSize: 14,
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
    borderColor: "#5A2529",
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
    color: "#E04B55",
  },

  rodape: {
    textAlign: "center",
    marginTop: 8,
    color: "#444444",
    fontSize: 13,
  },
});
