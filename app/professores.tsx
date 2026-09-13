import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Permissao from "@/components/Permissao";
import ProfessorCard from "@/components/ProfessorCard";
import RotaPermissao from "@/components/RotaPermissao";

import { formatarCpf, formatarTelefone } from "@/utils/masks";

import { listarProfessores } from "@/services/professorService";

export default function ProfessoresScreen() {
  const router = useRouter();

  const [professores, setProfessores] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");

  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [sort, setSort] = useState("id");
  const [direction, setDirection] = useState("desc");

  const carregarPrimeiraPagina = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarProfessores(
        0,
        10,
        pesquisa,
        sort,
        direction,
      );

      const novosProfessores = resposta.content ?? resposta;

      setProfessores(novosProfessores);
      setPagina(0);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar professores.");
      }
    } finally {
      setCarregando(false);
    }
  }, [pesquisa, sort, direction]);

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
      setMensagem("");

      const proximaPagina = pagina + 1;

      const resposta = await listarProfessores(
        proximaPagina,
        10,
        pesquisa,
        sort,
        direction,
      );

      const novosProfessores = resposta.content ?? resposta;

      setProfessores((professoresAtuais) => [
        ...professoresAtuais,
        ...novosProfessores,
      ]);

      setPagina(proximaPagina);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar professores.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function executarPesquisa() {
    setPesquisa(textoPesquisa.trim());
  }

  function ordenarPor(campo: string) {
    if (sort === campo) {
      setDirection((valorAtual) => (valorAtual === "asc" ? "desc" : "asc"));
    } else {
      setSort(campo);
      setDirection("asc");
    }
  }

  return (
    <RotaPermissao permissao="PROFESSOR_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Professores</Text>

          <Permissao permissao="PROFESSOR_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/professor/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Novo professor</Text>
            </Pressable>
          </Permissao>
        </View>

        <View style={styles.pesquisaContainer}>
          <TextInput
            style={styles.inputPesquisa}
            placeholder="Pesquisar professor..."
            placeholderTextColor="#888888"
            value={textoPesquisa}
            onChangeText={setTextoPesquisa}
            onSubmitEditing={executarPesquisa}
            returnKeyType="search"
          />

          <Pressable style={styles.botaoPesquisa} onPress={executarPesquisa}>
            <Text style={styles.botaoPesquisaTexto}>🔎</Text>
          </Pressable>
        </View>

        <View style={styles.ordenacaoContainer}>
          <Text style={styles.ordenacaoTexto}>Ordenar por:</Text>

          <Pressable
            style={[
              styles.botaoOrdenacao,
              sort === "nome" && styles.botaoOrdenacaoAtivo,
            ]}
            onPress={() => ordenarPor("nome")}
          >
            <Text
              style={[
                styles.botaoOrdenacaoTexto,
                sort === "nome" && styles.botaoOrdenacaoTextoAtivo,
              ]}
            >
              Nome {sort === "nome" ? (direction === "asc" ? "↑" : "↓") : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.botaoOrdenacao,
              sort === "id" && styles.botaoOrdenacaoAtivo,
            ]}
            onPress={() => ordenarPor("id")}
          >
            <Text
              style={[
                styles.botaoOrdenacaoTexto,
                sort === "id" && styles.botaoOrdenacaoTextoAtivo,
              ]}
            >
              ID {sort === "id" ? (direction === "asc" ? "↑" : "↓") : ""}
            </Text>
          </Pressable>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={professores}
            keyExtractor={(professor) => professor.id.toString()}
            renderItem={({ item }) => (
              <ProfessorCard
                nome={item.nome}
                cpf={item.cpf ? formatarCpf(item.cpf) : ""}
                telefone={item.telefone ? formatarTelefone(item.telefone) : ""}
                ativo={item.ativo}
                onPress={() => router.push(`/professor/${item.id}`)}
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
    marginBottom: 16,
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

  pesquisaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  inputPesquisa: {
    flex: 1,
    height: 46,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },

  botaoPesquisa: {
    height: 46,
    width: 50,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoPesquisaTexto: {
    fontSize: 20,
  },

  ordenacaoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  ordenacaoTexto: {
    color: "#BBBBBB",
    fontSize: 14,
    marginRight: 8,
  },

  botaoOrdenacao: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#1A1A1A",
  },

  botaoOrdenacaoAtivo: {
    borderColor: "#C1121F",
  },

  botaoOrdenacaoTexto: {
    color: "#BBBBBB",
    fontSize: 14,
    fontWeight: "600",
  },

  botaoOrdenacaoTextoAtivo: {
    color: "#FFFFFF",
  },

  mensagem: {
    color: "#E04B55",
    fontSize: 15,
  },

  carregando: {
    marginVertical: 20,
  },
});
