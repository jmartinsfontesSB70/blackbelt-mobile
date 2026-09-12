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

import PresencaCard from "@/components/PresencaCard";

import { listarPresencas } from "@/services/presencaService";

export default function PresencasScreen() {
  const router = useRouter();

  const [presencas, setPresencas] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const carregarPrimeiraPagina = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarPresencas(0, 10);

      const novasPresencas = resposta.content ?? resposta;

      setPresencas(novasPresencas);
      setPagina(0);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar presenças.");
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

      const resposta = await listarPresencas(proximaPagina, 10);

      const novasPresencas = resposta.content ?? resposta;

      setPresencas((presencasAtuais) => [
        ...presencasAtuais,
        ...novasPresencas,
      ]);

      setPagina(proximaPagina);
      setTemMais(!resposta.last);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar presenças.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <RotaPermissao permissao="PRESENCA_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Presenças</Text>

          <View style={styles.botoesNovo}>
            <Permissao permissao="PRESENCA_CRIAR" esconder>
              <Pressable
                style={styles.botaoNovo}
                onPress={() => router.push("/presenca/chamada")}
              >
                <Text style={styles.botaoNovoTexto}>+ Nova chamada</Text>
              </Pressable>
            </Permissao>

            <Permissao permissao="PRESENCA_CRIAR" esconder>
              <Pressable
                style={styles.botaoNovo}
                onPress={() => router.push("/presenca/novo")}
              >
                <Text style={styles.botaoNovoTexto}>+ Nova presença</Text>
              </Pressable>
            </Permissao>
          </View>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : (
          <FlatList
            data={presencas}
            keyExtractor={(presenca) => presenca.id.toString()}
            renderItem={({ item }) => (
              <PresencaCard
                alunoNome={item.alunoNome}
                turmaNome={item.turmaNome}
                data={item.data}
                presente={item.presente}
                onPress={() => router.push(`/presenca/${item.id}`)}
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 8,
  },

  botoesNovo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },

  botaoNovo: {
    backgroundColor: "#C1121F",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 1,
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
