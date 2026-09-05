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

import ModalidadeCard from "@/components/ModalidadeCard";
import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

import { listarModalidades } from "@/services/modalidadeService";

export default function ModalidadesScreen() {
  const router = useRouter();

  const [modalidades, setModalidades] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const carregarPrimeiraPagina = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarModalidades(0, 10);

      const novasModalidades = resposta.content ?? resposta;

      setModalidades(novasModalidades);
      setPagina(0);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar modalidades.");
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

      const resposta = await listarModalidades(proximaPagina, 10);

      const novasModalidades = resposta.content ?? resposta;

      setModalidades((modalidadesAtuais) => [
        ...modalidadesAtuais,
        ...novasModalidades,
      ]);

      setPagina(proximaPagina);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar modalidades.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <RotaPermissao permissao="MODALIDADE_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Modalidades</Text>

          <Permissao permissao="MODALIDADE_CRIAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/modalidade/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Nova modalidade</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={modalidades}
            keyExtractor={(modalidade) => modalidade.id.toString()}
            renderItem={({ item }) => (
              <ModalidadeCard
                nome={item.nome}
                descricao={item.descricao}
                ativa={item.ativa}
                onPress={() => router.push(`/modalidade/${item.id}`)}
              />
            )}
            onEndReached={carregarProximaPagina}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              carregando ? (
                <ActivityIndicator style={styles.carregando} />
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
    backgroundColor: "#f5f6f8",
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
    color: "#111827",
  },

  botaoNovo: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  botaoNovoTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  mensagem: {
    color: "#b91c1c",
    fontSize: 15,
  },

  carregando: {
    marginVertical: 20,
  },
});
