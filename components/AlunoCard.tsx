import { Pressable, StyleSheet, Text } from "react-native";

type AlunoCardProps = {
  nome: string;
  cpf: string;
  onPress: () => void;
};

export default function AlunoCard({ nome, cpf, onPress }: AlunoCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.nome}>{nome}</Text>
      <Text style={styles.dado}>CPF: {cpf || "Não informado"}</Text>
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

  nome: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  dado: {
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
  },
});
