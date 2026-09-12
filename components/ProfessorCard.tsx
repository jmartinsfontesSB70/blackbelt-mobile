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
    color: "#75D89A",
    backgroundColor: "#12351F",
  },

  statusInativo: {
    color: "#F08A91",
    backgroundColor: "#3A171A",
  },
});
