import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AlunoCard from "@/components/AlunoCard";
import { listarAlunos } from "@/services/alunoService";
import { useRouter } from "expo-router";

export default function AlunosScreen() {
  const router = useRouter();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarAlunos();
  }, [pagina]);

  async function carregarAlunos() {
    if (carregando || !temMais) {
      return;
    }

    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarAlunos(pagina, 10);

      const novosAlunos = resposta.content ?? resposta;

      setAlunos((alunosAtuais) => [...alunosAtuais, ...novosAlunos]);

      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar alunos.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function carregarProximaPagina() {
    if (!carregando && temMais) {
      setPagina((paginaAtual) => paginaAtual + 1);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Alunos</Text>

      {mensagem ? (
        <Text>{mensagem}</Text>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(aluno) => aluno.id.toString()}
          renderItem={({ item }) => (
            <AlunoCard
              nome={item.nome}
              cpf={item.cpf}
              onPress={() => router.push(`/aluno/${item.id}`)}
            />
          )}
          onEndReached={carregarProximaPagina}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            carregando ? <ActivityIndicator style={styles.carregando} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  carregando: {
    marginVertical: 20,
  },
});
