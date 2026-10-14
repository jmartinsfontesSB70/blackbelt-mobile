import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import MenuItem from "@/components/MenuItem";
import Permissao from "@/components/Permissao";

export default function FinanceiroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Financeiro</Text>

        <Text style={styles.descricao}>Gestão financeira da academia</Text>
      </View>

      {/* OPÇÕES */}
      <View style={styles.opcoes}>
        <Permissao permissao="TIPO_COBRANCA_LISTAR" esconder>
          <MenuItem
            titulo="Tipos de cobrança"
            onPress={() => router.push("/TiposCobranca")}
          />
        </Permissao>

        <Permissao permissao="COBRANCA_LISTAR" esconder>
          <MenuItem
            titulo="Cobranças"
            onPress={() => router.push("/cobrancas")}
          />
        </Permissao>
      </View>
    </View>
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
    marginBottom: 28,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  descricao: {
    color: "#777777",
    fontSize: 14,
    marginTop: 5,
  },

  opcoes: {
    gap: 10,
  },
});
