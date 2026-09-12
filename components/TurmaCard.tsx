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
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
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

  statusAtiva: {
    color: "#75D89A",
    backgroundColor: "#12351F",
  },

  statusInativa: {
    color: "#F08A91",
    backgroundColor: "#3A171A",
  },
});
