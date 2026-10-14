import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type AlunoCardProps = {
  nome: string;
  cpf: string;
  fotoUri?: string;
  onPress: () => void;
};

export default function AlunoCard({
  nome,
  cpf,
  fotoUri,
  onPress,
}: AlunoCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.conteudo}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.foto} />
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Text style={styles.fotoPlaceholderTexto}>👤</Text>
          </View>
        )}

        <View style={styles.informacoes}>
          <Text style={styles.nome}>{nome}</Text>

          <Text style={styles.dado}>CPF: {cpf || "Não informado"}</Text>
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

  conteudo: {
    flexDirection: "row",
    alignItems: "center",
  },

  foto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: "#1A1A1A",
  },

  fotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  fotoPlaceholderTexto: {
    fontSize: 28,
  },

  informacoes: {
    flex: 1,
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
