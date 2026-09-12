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
import TurmaCard from "@/components/TurmaCard";

import { listarTurmas } from "@/services/turmaService";

export default function TurmasScreen() {
  const router = useRouter();

  const [turmas, setTurmas] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const carregarPrimeiraPagina = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarTurmas(0, 10);

      const novasTurmas = resposta.content ?? resposta;

      setTurmas(novasTurmas);
      setPagina(0);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar turmas.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPrimeiraPagina();
    }, [carregarPrimeiraPagina]),
  );

  async function carregarProximaPagina() {
    if (carregando || !temMais) {
      return;
    }

    try {
      setCarregando(true);

      const proximaPagina = pagina + 1;

      const resposta = await listarTurmas(proximaPagina, 10);

      const novasTurmas = resposta.content ?? resposta;

      setTurmas((turmasAtuais) => [...turmasAtuais, ...novasTurmas]);

      setPagina(proximaPagina);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar turmas.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <RotaPermissao permissao="TURMA_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Turmas</Text>

          <Permissao permissao="TURMA_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/turma/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Nova turma</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={turmas}
            keyExtractor={(turma) => turma.id.toString()}
            renderItem={({ item }) => (
              <TurmaCard
                nome={item.nome}
                modalidadeNome={item.modalidadeNome}
                professorNome={item.professorNome}
                diasSemana={item.diasSemana}
                horarioInicio={item.horarioInicio}
                horarioFim={item.horarioFim}
                capacidade={item.capacidade}
                ativa={item.ativa}
                onPress={() => router.push(`/turma/${item.id}`)}
              />
            )}
            onEndReached={carregarProximaPagina}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              carregando ? (
                <ActivityIndicator style={styles.carregando} color="#C1121F" />
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#0A0A0A",
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  botaoNovo: {
    backgroundColor: "#C1121F",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  botaoNovoTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  mensagem: {
    color: "#E04B55",
    fontSize: 15,
  },

  carregando: {
    marginVertical: 20,
  },
});
