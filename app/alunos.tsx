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

import AlunoCard from "@/components/AlunoCard";
import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";
import { listarAlunos } from "@/services/alunoService";
import { formatarCpf } from "@/utils/masks";

export default function AlunosScreen() {
  const router = useRouter();

  const [alunos, setAlunos] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const carregarPrimeiraPagina = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarAlunos(0, 10);

      const novosAlunos = resposta.content ?? resposta;

      setAlunos(novosAlunos);
      setPagina(0);
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

      const resposta = await listarAlunos(proximaPagina, 10);

      const novosAlunos = resposta.content ?? resposta;

      setAlunos((alunosAtuais) => [...alunosAtuais, ...novosAlunos]);

      setPagina(proximaPagina);
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

  return (
    <RotaPermissao permissao="ALUNO_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Alunos</Text>

          <Permissao permissao="ALUNO_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/aluno/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Novo aluno</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={alunos}
            keyExtractor={(aluno) => aluno.id.toString()}
            renderItem={({ item }) => (
              <AlunoCard
                nome={item.nome}
                cpf={item.cpf ? formatarCpf(item.cpf) : ""}
                onPress={() => router.push(`/aluno/${item.id}`)}
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
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  botaoNovo: {
    backgroundColor: "#C1121F",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  botaoNovoTexto: {
    color: "#FFFFFF",
    fontSize: 14,
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
