import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { listarPermissoes } from "@/services/permissaoService";

export default function PermissoesScreen() {
  const [permissoes, setPermissoes] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const carregarPermissoes = useCallback(async () => {
    try {
      setCarregando(true);
      setMensagem("");

      const resposta = await listarPermissoes();

      setPermissoes(resposta);
    } catch (error) {
      if (error instanceof Error) {
        setMensagem(error.message);
      } else {
        setMensagem("Erro ao carregar permissões.");
      }
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPermissoes();
    }, [carregarPermissoes]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Permissões</Text>

      {mensagem ? (
        <Text style={styles.mensagem}>{mensagem}</Text>
      ) : (
        <FlatList
          data={permissoes}
          keyExtractor={(permissao) => permissao.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>

              {item.descricao ? (
                <Text style={styles.detalhe}>{item.descricao}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            !carregando ? (
              <Text style={styles.vazio}>Nenhuma permissão encontrada.</Text>
            ) : null
          }
          ListFooterComponent={
            carregando ? <ActivityIndicator style={styles.carregando} /> : null
          }
          showsVerticalScrollIndicator={false}
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
    backgroundColor: "#f5f6f8",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  nome: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },

  detalhe: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 3,
  },

  mensagem: {
    color: "#b91c1c",
    fontSize: 15,
  },

  vazio: {
    color: "#6b7280",
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },

  carregando: {
    marginVertical: 20,
  },
});
