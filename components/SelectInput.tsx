import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SelectOption = {
  id: number | string;
  nome: string;
};

type SelectInputProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  selectedId: string;
  onSelect: (item: SelectOption) => void;
};

export default function SelectInput({
  label,
  value,
  placeholder,
  options,
  selectedId,
  onSelect,
}: SelectInputProps) {
  const [aberto, setAberto] = useState(false);

  function selecionar(item: SelectOption) {
    onSelect(item);
    setAberto(false);
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <Pressable style={styles.input} onPress={() => setAberto(true)}>
        <Text
          style={[
            styles.valor,
            !options.find((item) => String(item.id) === String(selectedId)) &&
              styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {options.find((item) => String(item.id) === String(selectedId))
            ?.nome || placeholder}
        </Text>

        <Text style={styles.seta}>▼</Text>
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>{label.replace(" *", "")}</Text>

              <TouchableOpacity
                onPress={() => setAberto(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.fechar}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.lista}
            >
              {options.length === 0 ? (
                <Text style={styles.semOpcoes}>Nenhuma opção disponível.</Text>
              ) : (
                options.map((item) => {
                  const selecionado = String(item.id) === String(selectedId);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.opcao,
                        selecionado && styles.opcaoSelecionada,
                      ]}
                      onPress={() => selecionar(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.opcaoTexto,
                          selecionado && styles.opcaoTextoSelecionado,
                        ]}
                      >
                        {item.nome}
                      </Text>

                      {selecionado ? <Text style={styles.check}>✓</Text> : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => setAberto(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CCCCCC",
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    height: 48,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  valor: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    marginRight: 10,
  },

  placeholder: {
    color: "#777777",
  },

  seta: {
    fontSize: 12,
    color: "#888888",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.70)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#151515",
    borderRadius: 18,
    maxHeight: "75%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#242424",
  },

  cabecalho: {
    minHeight: 60,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  fechar: {
    fontSize: 20,
    color: "#888888",
    padding: 5,
  },

  lista: {
    padding: 12,
  },

  opcao: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#2B2B2B",
  },

  opcaoSelecionada: {
    backgroundColor: "#C1121F",
    borderColor: "#C1121F",
  },

  opcaoTexto: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#CCCCCC",
  },

  opcaoTextoSelecionado: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  check: {
    fontSize: 18,
    color: "#FFFFFF",
    marginLeft: 10,
  },

  semOpcoes: {
    textAlign: "center",
    color: "#888888",
    fontSize: 15,
    paddingVertical: 25,
  },

  botaoCancelar: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoCancelarTexto: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "600",
  },
});
