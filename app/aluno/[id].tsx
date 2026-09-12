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

import { buscarAluno, excluirAluno } from "@/services/alunoService";

import {
  formatarCep,
  formatarCpf,
  formatarDataExibicao,
  formatarTelefone,
} from "@/utils/masks";

export default function AlunoDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [aluno, setAluno] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarAluno();
  }, [id]);

  async function carregarAluno() {
    try {
      setMensagem("");

      const resposta = await buscarAluno(id);

      setAluno(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar aluno.");
      }
    }
  }

  function confirmarExclusao() {
    Alert.alert("Excluir aluno", `Deseja realmente excluir ${aluno.nome}?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: executarExclusao,
      },
    ]);
  }

  async function executarExclusao() {
    try {
      setExcluindo(true);

      await excluirAluno(Number(id));

      Alert.alert("Sucesso", "Aluno excluído com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/alunos"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir o aluno.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="ALUNO_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>
          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!aluno) {
    return (
      <RotaPermissao permissao="ALUNO_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />
          <Text style={styles.carregandoTexto}>Carregando aluno...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="ALUNO_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: aluno.nome,
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
                {aluno.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>{aluno.nome}</Text>

              <View
                style={[
                  styles.status,
                  aluno.ativo ? styles.statusAtivo : styles.statusInativo,
                ]}
              >
                <Text
                  style={[
                    styles.statusTexto,
                    aluno.ativo
                      ? styles.statusTextoAtivo
                      : styles.statusTextoInativo,
                  ]}
                >
                  {aluno.ativo ? "ATIVO" : "INATIVO"}
                </Text>
              </View>
            </View>
          </View>

          {/* Dados pessoais */}

          <View style={styles.card}>
            <View style={styles.tituloSecao}>
              <View style={styles.iconeSecao}>
                <Text style={styles.iconeTexto}>👤</Text>
              </View>

              <View>
                <Text style={styles.secao}>Dados pessoais</Text>

                <Text style={styles.descricaoSecao}>
                  Informações básicas do aluno
                </Text>
              </View>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>CPF</Text>

              <Text style={styles.valor}>
                {aluno.cpf ? formatarCpf(aluno.cpf) : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Data de nascimento</Text>

              <Text style={styles.valor}>
                {aluno.dataNascimento
                  ? formatarDataExibicao(aluno.dataNascimento)
                  : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Telefone</Text>

              <Text style={styles.valor}>
                {aluno.telefone
                  ? formatarTelefone(aluno.telefone)
                  : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>E-mail</Text>

              <Text style={styles.valor}>{aluno.email || "Não informado"}</Text>
            </View>
          </View>

          {/* Endereço */}

          <View style={styles.card}>
            <View style={styles.tituloSecao}>
              <View style={styles.iconeSecao}>
                <Text style={styles.iconeTexto}>📍</Text>
              </View>

              <View>
                <Text style={styles.secao}>Endereço</Text>

                <Text style={styles.descricaoSecao}>
                  Localização e endereço residencial
                </Text>
              </View>
            </View>

            {aluno.endereco ? (
              <>
                <View style={styles.campo}>
                  <Text style={styles.label}>Rua</Text>

                  <Text style={styles.valor}>
                    {aluno.endereco.rua}, {aluno.endereco.numero}
                  </Text>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.label}>Bairro</Text>

                  <Text style={styles.valor}>{aluno.endereco.bairro}</Text>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.label}>Cidade / Estado</Text>

                  <Text style={styles.valor}>
                    {aluno.endereco.cidade} - {aluno.endereco.estado}
                  </Text>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.label}>CEP</Text>

                  <Text style={styles.valor}>
                    {aluno.endereco.cep
                      ? formatarCep(aluno.endereco.cep)
                      : "Não informado"}
                  </Text>
                </View>

                {aluno.endereco.pontoReferencia ? (
                  <View style={styles.campo}>
                    <Text style={styles.label}>Ponto de referência</Text>

                    <Text style={styles.valor}>
                      {aluno.endereco.pontoReferencia}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.semEndereco}>Endereço não informado.</Text>
            )}
          </View>

          {/* Ações */}

          <View style={styles.acoes}>
            <Permissao permissao="ALUNO_EDITAR" esconder>
              <Pressable
                style={styles.botaoEditar}
                onPress={() => router.push(`/aluno/editar/${id}`)}
                disabled={excluindo}
              >
                <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
              </Pressable>
            </Permissao>

            <Permissao permissao="ALUNO_EXCLUIR" esconder>
              <Pressable
                style={[
                  styles.botaoExcluir,
                  excluindo && styles.botaoDesabilitado,
                ]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botaoExcluirTexto}>🗑️ Excluir</Text>
                )}
              </Pressable>
            </Permissao>
          </View>

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
    paddingBottom: 50,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    backgroundColor: "#12351F",
  },

  statusInativo: {
    backgroundColor: "#3A171A",
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },

  statusTextoAtivo: {
    color: "#75D89A",
  },

  statusTextoInativo: {
    color: "#F08A91",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#242424",
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
    borderWidth: 1,
    borderColor: "#2B2B2B",
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
    color: "#FFFFFF",
  },

  semEndereco: {
    color: "#888888",
    fontSize: 15,
    marginTop: 8,
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
    color: "#E04B55",
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
    color: "#666666",
    fontSize: 13,
  },
});
