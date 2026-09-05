import { Pressable, StyleSheet, Text, View } from "react-native";

interface PresencaCardProps {
  alunoNome: string;
  turmaNome: string;
  data: string;
  presente: boolean;
  onPress: () => void;
}

export default function PresencaCard({
  alunoNome,
  turmaNome,
  data,
  presente,
  onPress,
}: PresencaCardProps) {
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
            presente ? styles.statusPresente : styles.statusAusente,
          ]}
        >
          <Text
            style={[
              styles.statusTexto,
              presente ? styles.statusTextoPresente : styles.statusTextoAusente,
            ]}
          >
            {presente ? "Presente" : "Ausente"}
          </Text>
        </View>
      </View>

      <Text style={styles.turmaNome}>🥋 {turmaNome}</Text>

      <Text style={styles.data}>Data: {formatarData(data)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
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
    color: "#111827",
    marginRight: 10,
  },

  turmaNome: {
    fontSize: 14,
    color: "#374151",
    marginTop: 10,
  },

  data: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 7,
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusPresente: {
    backgroundColor: "#dcfce7",
  },

  statusAusente: {
    backgroundColor: "#fee2e2",
  },

  statusTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },

  statusTextoPresente: {
    color: "#166534",
  },

  statusTextoAusente: {
    color: "#991b1b",
  },
});
