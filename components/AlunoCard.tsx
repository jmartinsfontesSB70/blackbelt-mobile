import { StyleSheet, Text, TouchableOpacity } from "react-native";

type AlunoCardProps = {
  nome: string;
  cpf: string;
  onPress: () => void;
};

export default function AlunoCard({ nome, cpf, onPress }: AlunoCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.nome}>{nome}</Text>

      <Text style={styles.cpf}>CPF: {cpf}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },

  nome: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
  },

  cpf: {
    fontSize: 14,
  },
});
