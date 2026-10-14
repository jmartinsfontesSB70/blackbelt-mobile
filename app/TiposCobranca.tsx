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
import TipoCobrancaCard from "@/components/TipoCobrancaCard";

import { listarTiposCobranca } from "@/services/tipoCobrancaService";

export default function TiposCobrancaScreen() {
  const router = useRouter();

  const [tiposCobranca, setTiposCobranca] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarTiposCobranca = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarTiposCobranca();

      setTiposCobranca(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar tipos de cobrança.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarTiposCobranca();
    }, [carregarTiposCobranca]),
  );

  return (
    <RotaPermissao permissao="TIPO_COBRANCA_LISTAR">
      <View style={styles.container}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Tipos de cobrança</Text>

          <Permissao permissao="TIPO_COBRANCA_CADASTRAR" esconder>
            <Pressable
              style={styles.botaoNovo}
              onPress={() => router.push("/tipo-cobranca/novo")}
            >
              <Text style={styles.botaoNovoTexto}>+ Novo tipo</Text>
            </Pressable>
          </Permissao>
        </View>

        {mensagem ? (
          <Text style={styles.mensagem}>{mensagem}</Text>
        ) : carregando && tiposCobranca.length === 0 ? (
          <ActivityIndicator style={styles.carregando} color="#C1121F" />
        ) : (
          <FlatList
            data={tiposCobranca}
            keyExtractor={(tipo) => tipo.id.toString()}
            renderItem={({ item }) => (
              <TipoCobrancaCard
                nome={item.nome}
                descricao={item.descricao}
                valorUnitario={item.valorUnitario}
                ativo={item.ativo}
                onPress={() => router.push(`/tipo-cobranca/${item.id}`)}
              />
            )}
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
    marginTop: 40,
  },
});
