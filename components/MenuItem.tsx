import { StyleSheet, Text, TouchableOpacity } from "react-native";

type MenuItemProps = {
  titulo: string;
  onPress: () => void;
};

export default function MenuItem({ titulo, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.texto}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    elevation: 3,
  },

  texto: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
