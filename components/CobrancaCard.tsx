import { Pressable, StyleSheet, Text, View } from "react-native";

type CobrancaCardProps = {
  alunoNome: string;
  tipoCobrancaNome: string;
  descricao: string;
  dataVencimento: string;
  valor: number;
  status: string;
  onPress: () => void;
};

export default function CobrancaCard({
  alunoNome,
  tipoCobrancaNome,
  descricao,
  dataVencimento,
  valor,
  status,
  onPress,
}: CobrancaCardProps) {
  function formatarData(data: string) {
    if (!data) {
      return "";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function formatarValor(valor: number) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function obterCorStatus() {
    switch (status) {
      case "PAGO":
        return "#75D89A";

      case "PARCIAL":
        return "#F2C94C";

      case "CANCELADO":
        return "#F08A91";

      default:
        return "#BBBBBB";
    }
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cabecalho}>
        <View style={styles.informacoes}>
          <Text style={styles.alunoNome}>{alunoNome}</Text>

          <Text style={styles.tipoCobranca}>{tipoCobrancaNome}</Text>
        </View>

        <Text style={[styles.status, { color: obterCorStatus() }]}>
          {status}
        </Text>
      </View>

      <Text style={styles.descricao}>{descricao}</Text>

      <View style={styles.linha} />

      <View style={styles.dados}>
        <View style={styles.dado}>
          <Text style={styles.label}>Vencimento</Text>

          <Text style={styles.valorTexto}>{formatarData(dataVencimento)}</Text>
        </View>

        <View style={styles.dadoValor}>
          <Text style={styles.label}>Valor</Text>

          <Text style={styles.valor}>{formatarValor(valor)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#242424",
    elevation: 2,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  informacoes: {
    flex: 1,
    paddingRight: 10,
  },

  alunoNome: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },

  tipoCobranca: {
    fontSize: 13,
    color: "#888888",
  },

  status: {
    fontSize: 12,
    fontWeight: "bold",
  },

  descricao: {
    fontSize: 14,
    color: "#BBBBBB",
    marginTop: 12,
  },

  linha: {
    height: 1,
    backgroundColor: "#242424",
    marginVertical: 12,
  },

  dados: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dado: {
    flex: 1,
  },

  dadoValor: {
    alignItems: "flex-end",
  },

  label: {
    fontSize: 11,
    color: "#777777",
    marginBottom: 3,
  },

  valorTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DDDDDD",
  },

  valor: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
