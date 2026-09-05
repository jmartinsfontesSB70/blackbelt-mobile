import { Pressable, StyleSheet, Text } from "react-native";

type TurmaCardProps = {
  nome: string;
  modalidadeNome: string;
  professorNome: string;
  diasSemana: string;
  horarioInicio: string;
  horarioFim: string;
  capacidade: number;
  ativa: boolean;
  onPress: () => void;
};

export default function TurmaCard({
  nome,
  modalidadeNome,
  professorNome,
  diasSemana,
  horarioInicio,
  horarioFim,
  capacidade,
  ativa,
  onPress,
}: TurmaCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.nome}>{nome}</Text>

      <Text style={styles.dado}>
        Modalidade: {modalidadeNome || "Não informada"}
      </Text>

      <Text style={styles.dado}>
        Professor: {professorNome || "Não informado"}
      </Text>

      <Text style={styles.dado}>Dias: {diasSemana || "Não informado"}</Text>

      <Text style={styles.dado}>
        Horário: {formatarHorario(horarioInicio)} -{" "}
        {formatarHorario(horarioFim)}
      </Text>

      <Text style={styles.dado}>Capacidade: {capacidade}</Text>

      <Text
        style={[
          styles.status,
          ativa ? styles.statusAtiva : styles.statusInativa,
        ]}
      >
        {ativa ? "ATIVA" : "INATIVA"}
      </Text>
    </Pressable>
  );
}

function formatarHorario(horario: string) {
  if (!horario) {
    return "--:--";
  }

  return horario.substring(0, 5);
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

  statusAtiva: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },

  statusInativa: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
  },
});
