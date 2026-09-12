import { Pressable, StyleSheet, Text, View } from "react-native";

interface MatriculaCardProps {
  alunoNome: string;
  turmaNome: string;
  dataMatricula: string;
  ativa: boolean;
  onPress: () => void;
}

export default function MatriculaCard({
  alunoNome,
  turmaNome,
  dataMatricula,
  ativa,
  onPress,
}: MatriculaCardProps) {
  function formatarData(data: string) {
    if (!data) {
      return "";
    }

    const [ano, mes, dia] = data.split("-");

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cabecalho}>
        <Text style={styles.alunoNome}>{alunoNome}</Text>

        <View
          style={[
            styles.status,
            ativa ? styles.statusAtiva : styles.statusInativa,
          ]}
        >
          <Text
            style={[
              styles.statusTexto,
              ativa ? styles.statusTextoAtiva : styles.statusTextoInativa,
            ]}
          >
            {ativa ? "Ativa" : "Inativa"}
          </Text>
        </View>
      </View>

      <Text style={styles.turmaNome}>🥋 {turmaNome}</Text>

      <Text style={styles.data}>Matrícula: {formatarData(dataMatricula)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#242424",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  alunoNome: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 10,
  },

  turmaNome: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 10,
  },

  data: {
    fontSize: 13,
    color: "#888888",
    marginTop: 7,
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },

  statusAtiva: {
    backgroundColor: "#12351F",
    borderColor: "#2A6B43",
  },

  statusInativa: {
    backgroundColor: "#3A171A",
    borderColor: "#5A2529",
  },

  statusTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },

  statusTextoAtiva: {
    color: "#75D89A",
  },

  statusTextoInativa: {
    color: "#F08A91",
  },
});
