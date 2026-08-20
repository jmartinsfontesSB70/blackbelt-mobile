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
      <View style={styles.container}>
        <Text style={styles.erro}>{mensagem}</Text>
      </View>
    );
  }

  if (!aluno) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" />
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

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Ficha do Aluno</Text>

        <View style={styles.card}>
          <Text style={styles.secao}>Dados pessoais</Text>

          <Text style={styles.label}>Nome</Text>
          <Text style={styles.valor}>{aluno.nome}</Text>

          <Text style={styles.label}>CPF</Text>
          <Text style={styles.valor}>{aluno.cpf}</Text>

          <Text style={styles.label}>Data de nascimento</Text>
          <Text style={styles.valor}>{aluno.dataNascimento}</Text>

          <Text style={styles.label}>Telefone</Text>
          <Text style={styles.valor}>{aluno.telefone}</Text>

          <Text style={styles.label}>E-mail</Text>
          <Text style={styles.valor}>{aluno.email}</Text>

          <Text style={styles.label}>Situação</Text>
          <Text style={styles.valor}>{aluno.ativo ? "Ativo" : "Inativo"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.secao}>Endereço</Text>

          <Text style={styles.label}>Rua</Text>
          <Text style={styles.valor}>
            {aluno.endereco.rua}, {aluno.endereco.numero}
          </Text>

          <Text style={styles.label}>Bairro</Text>
          <Text style={styles.valor}>{aluno.endereco.bairro}</Text>

          <Text style={styles.label}>Cidade / Estado</Text>
          <Text style={styles.valor}>
            {aluno.endereco.cidade} - {aluno.endereco.estado}
          </Text>

          <Text style={styles.label}>CEP</Text>
          <Text style={styles.valor}>{aluno.endereco.cep}</Text>

          {aluno.endereco.pontoReferencia ? (
            <>
              <Text style={styles.label}>Ponto de referência</Text>
              <Text style={styles.valor}>{aluno.endereco.pontoReferencia}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    padding: 24,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  secao: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },

  valor: {
    fontSize: 17,
  },

  erro: {
    fontSize: 16,
    textAlign: "center",
  },
});
