import { Pressable, StyleSheet, Text } from "react-native";

type ProfessorCardProps = {
  nome: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  onPress: () => void;
};

export default function ProfessorCard({
  nome,
  cpf,
  telefone,
  ativo,
  onPress,
}: ProfessorCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.nome}>{nome}</Text>

      <Text style={styles.dado}>CPF: {cpf || "Não informado"}</Text>

      <Text style={styles.dado}>Telefone: {telefone || "Não informado"}</Text>

      <Text
        style={[
          styles.status,
          ativo ? styles.statusAtivo : styles.statusInativo,
        ]}
      >
        {ativo ? "ATIVO" : "INATIVO"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },

  nome: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },

  dado: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  status: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: "bold",
  },

  statusAtivo: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },

  statusInativo: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
  },
});
