import { Pressable, StyleSheet, Text, View } from "react-native";

type TipoCobrancaCardProps = {
  nome: string;
  descricao?: string;
  valorUnitario: number;
  ativo: boolean;
  onPress: () => void;
};

export default function TipoCobrancaCard({
  nome,
  descricao,
  valorUnitario,
  ativo,
  onPress,
}: TipoCobrancaCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.conteudo}>
        <View style={styles.informacoes}>
          <Text style={styles.nome}>{nome}</Text>

          <Text style={styles.valor}>
            R$ {Number(valorUnitario).toFixed(2).replace(".", ",")}
          </Text>

          {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}

          <Text
            style={[
              styles.status,
              ativo ? styles.statusAtivo : styles.statusInativo,
            ]}
          >
            {ativo ? "ATIVO" : "INATIVO"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  conteudo: {
    flexDirection: "row",
  },

  informacoes: {
    flex: 1,
  },

  nome: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },

  valor: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },

  descricao: {
    color: "#BBBBBB",
    fontSize: 14,
    marginBottom: 6,
  },

  status: {
    fontSize: 12,
    fontWeight: "bold",
  },

  statusAtivo: {
    color: "#4CAF50",
  },

  statusInativo: {
    color: "#E04B55",
  },
});
