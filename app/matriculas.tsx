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

import MatriculaCard from "@/components/MatriculaCard";
import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { listarMatriculas } from "@/services/matriculaService";

export default function MatriculasScreen() {
  const router = useRouter();

  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const carregarPrimeiraPagina = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarMatriculas(0, 10);

      const novasMatriculas = resposta.content ?? resposta;

      setMatriculas(novasMatriculas);
      setPagina(0);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar matrículas.");
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

      const resposta = await listarMatriculas(proximaPagina, 10);

      const novasMatriculas = resposta.content ?? resposta;

      setMatriculas((matriculasAtuais) => [
        ...matriculasAtuais,
        ...novasMatriculas,
      ]);

      setPagina(proximaPagina);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar matrículas.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <RotaPermissao permissao="MATRICULA_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Matrículas</Text>

          <Permissao permissao="MATRICULA_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/matricula/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Nova matrícula</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={matriculas}
            keyExtractor={(matricula) => matricula.id.toString()}
            renderItem={({ item }) => (
              <MatriculaCard
                alunoNome={item.alunoNome}
                turmaNome={item.turmaNome}
                dataMatricula={item.dataMatricula}
                ativa={item.ativa}
                onPress={() => router.push(`/matricula/${item.id}`)}
              />
            )}
            onEndReached={carregarProximaPagina}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              carregando ? (
                <ActivityIndicator color="#C1121F" style={styles.carregando} />
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
