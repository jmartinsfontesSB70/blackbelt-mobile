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

import {
  formatarCep,
  formatarCpf,
  formatarDataExibicao,
  formatarTelefone,
} from "@/utils/masks";

import { buscarProfessor, excluirProfessor } from "@/services/professorService";

export default function ProfessorDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [professor, setProfessor] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarProfessor();
  }, [id]);

  async function carregarProfessor() {
    try {
      setMensagem("");

      const resposta = await buscarProfessor(id);

      setProfessor(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar professor.");
      }
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      "Excluir professor",
      `Deseja realmente excluir ${professor.nome}?`,
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
    try {
      setExcluindo(true);

      await excluirProfessor(Number(id));

      Alert.alert("Sucesso", "Professor excluído com sucesso!", [
        {
          text: "OK",
          onPress: () => router.dismissTo("/professores"),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Não foi possível excluir", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível excluir o professor.");
      }
    } finally {
      setExcluindo(false);
    }
  }

  if (mensagem) {
    return (
      <RotaPermissao permissao="PROFESSOR_LISTAR">
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Ops!</Text>

          <Text style={styles.erro}>{mensagem}</Text>
        </View>
      </RotaPermissao>
    );
  }

  if (!professor) {
    return (
      <RotaPermissao permissao="PROFESSOR_LISTAR">
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#C1121F" />

          <Text style={styles.carregandoTexto}>Carregando professor...</Text>
        </View>
      </RotaPermissao>
    );
  }

  return (
    <RotaPermissao permissao="PROFESSOR_LISTAR">
      <>
        <Stack.Screen
          options={{
            title: professor.nome,
          }}
        />

        <ScrollView
          style={styles.tela}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cabecalho}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {professor.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.cabecalhoInfo}>
              <Text style={styles.nome}>{professor.nome}</Text>

              <View
                style={[
                  styles.status,
                  professor.ativo ? styles.statusAtivo : styles.statusInativo,
                ]}
              >
                <Text
                  style={[
                    styles.statusTexto,
                    professor.ativo
                      ? styles.statusTextoAtivo
                      : styles.statusTextoInativo,
                  ]}
                >
                  {professor.ativo ? "ATIVO" : "INATIVO"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.secao}>Dados pessoais</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>CPF</Text>

              <Text style={styles.valor}>
                {professor.cpf ? formatarCpf(professor.cpf) : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Data de nascimento</Text>

              <Text style={styles.valor}>
                {professor.dataNascimento
                  ? formatarDataExibicao(professor.dataNascimento)
                  : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Telefone</Text>

              <Text style={styles.valor}>
                {professor.telefone
                  ? formatarTelefone(professor.telefone)
                  : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>E-mail</Text>

              <Text style={styles.valor}>
                {professor.email || "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.secao}>Dados profissionais</Text>

            <View style={styles.campo}>
              <Text style={styles.label}>Data de contratação</Text>

              <Text style={styles.valor}>
                {professor.dataContratacao
                  ? formatarDataExibicao(professor.dataContratacao)
                  : "Não informado"}
              </Text>
            </View>

            <View style={styles.campo}>
              <Text style={styles.label}>Valor da hora aula</Text>

              <Text style={styles.valor}>
                {professor.valorHoraAula != null
                  ? `R$ ${Number(professor.valorHoraAula)
                      .toFixed(2)
                      .replace(".", ",")}`
                  : "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.secao}>Endereço</Text>

            {professor.endereco ? (
              <>
                <View style={styles.campo}>
                  <Text style={styles.label}>Rua</Text>

                  <Text style={styles.valor}>
                    {professor.endereco.rua}, {professor.endereco.numero}
                  </Text>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.label}>Bairro</Text>

                  <Text style={styles.valor}>{professor.endereco.bairro}</Text>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.label}>Cidade / Estado</Text>

                  <Text style={styles.valor}>
                    {professor.endereco.cidade} - {professor.endereco.estado}
                  </Text>
                </View>

                <View style={styles.campo}>
                  <Text style={styles.label}>CEP</Text>

                  <Text style={styles.valor}>
                    {professor.endereco.cep
                      ? formatarCep(professor.endereco.cep)
                      : "Não informado"}
                  </Text>
                </View>

                {professor.endereco.pontoReferencia ? (
                  <View style={styles.campo}>
                    <Text style={styles.label}>Ponto de referência</Text>

                    <Text style={styles.valor}>
                      {professor.endereco.pontoReferencia}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <Text style={styles.semEndereco}>Endereço não informado.</Text>
            )}
          </View>

          <View style={styles.acoes}>
            <Permissao permissao="PROFESSOR_EDITAR" esconder>
              <Pressable
                style={styles.botaoEditar}
                onPress={() => router.push(`/professor/editar/${id}`)}
                disabled={excluindo}
              >
                <Text style={styles.botaoEditarTexto}>✏️ Editar</Text>
              </Pressable>
            </Permissao>

            <Permissao permissao="PROFESSOR_EXCLUIR" esconder>
              <Pressable
                style={[
                  styles.botaoExcluir,
                  excluindo && styles.botaoDesabilitado,
                ]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator color="#E04B55" />
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
    padding: 20,
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
    color: "#E04B55",
  },

  rodape: {
    textAlign: "center",
    marginTop: 8,
    color: "#666666",
    fontSize: 13,
  },
});
