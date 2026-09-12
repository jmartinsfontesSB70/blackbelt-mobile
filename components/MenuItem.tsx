import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuItemProps = {
  titulo: string;
  onPress: () => void;
};

export default function MenuItem({ titulo, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.conteudo}>
        <Text style={styles.texto}>{titulo}</Text>

        <Text style={styles.seta}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    height: 58,
    borderRadius: 14,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    elevation: 4,
  },

  conteudo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  texto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  seta: {
    color: "#777777",
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 30,
    marginTop: -2,
  },
});
