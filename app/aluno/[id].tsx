import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { apiFetch } from "@/services/api";

export default function AlunoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [aluno, setAluno] = useState<any>(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarAluno();
  }, []);

  async function carregarAluno() {
    try {
      setMensagem("");

      const resposta = await apiFetch(`/alunos/${id}`);

      setAluno(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar aluno.");
      }
    }
  }

  if (mensagem) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroTitulo}>Ops!</Text>
        <Text style={styles.erro}>{mensagem}</Text>
      </View>
    );
  }

  if (!aluno) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" />
        <Text style={styles.carregandoTexto}>Carregando aluno...</Text>
      </View>
    );
  }

  return (
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
          <Text style={styles.secao}>Dados pessoais</Text>

          <View style={styles.campo}>
            <Text style={styles.label}>CPF</Text>
            <Text style={styles.valor}>{aluno.cpf}</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Data de nascimento</Text>
            <Text style={styles.valor}>{aluno.dataNascimento}</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.valor}>{aluno.telefone}</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.valor}>{aluno.email}</Text>
          </View>
        </View>

        {/* Endereço */}
        <View style={styles.card}>
          <Text style={styles.secao}>Endereço</Text>

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
                <Text style={styles.valor}>{aluno.endereco.cep}</Text>
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

        <Text style={styles.rodape}>BlackBelt</Text>
      </ScrollView>
    </>
  );
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
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
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

  semEndereco: {
    color: "#6b7280",
    fontSize: 15,
    marginTop: 8,
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
