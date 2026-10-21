import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  atualizarAcademia,
  atualizarLogoAcademia,
  buscarAcademia,
  buscarLogoAcademia,
  type AcademiaRequest,
} from "../services/academiaService";

import Permissao from "@/components/Permissao";
import RotaPermissao from "@/components/RotaPermissao";

type LogoSelecionada = {
  uri: string;
  name: string;
  type: string;
};

const academiaInicial: AcademiaRequest = {
  nome: "",
  responsavel: "",
  cnpj: "",
  endereco: {
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    pontoReferencia: "",
  },
};

function mascararCnpj(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function mascararCep(valor: string): string {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);
  return numeros.replace(/^(\d{5})(\d)/, "$1-$2");
}

function arrayBufferParaBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const tamanhoBloco = 8192;
  let binario = "";

  for (let inicio = 0; inicio < bytes.length; inicio += tamanhoBloco) {
    const bloco = bytes.subarray(
      inicio,
      Math.min(inicio + tamanhoBloco, bytes.length),
    );

    binario += String.fromCharCode(...bloco);
  }

  return btoa(binario);
}

export default function DadosAcademiaScreen() {
  const [academia, setAcademia] = useState<AcademiaRequest>(academiaInicial);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [possuiLogo, setPossuiLogo] = useState(false);
  const [logoAtual, setLogoAtual] = useState<string | null>(null);
  const [logoSelecionada, setLogoSelecionada] =
    useState<LogoSelecionada | null>(null);

  useEffect(() => {
    carregarAcademia();
  }, []);

  async function carregarAcademia() {
    try {
      setErro("");

      const resposta = await buscarAcademia();

      setAcademia({
        nome: resposta.nome ?? "",
        responsavel: resposta.responsavel ?? "",
        cnpj: mascararCnpj(resposta.cnpj ?? ""),
        endereco: {
          rua: resposta.endereco?.rua ?? "",
          numero: resposta.endereco?.numero ?? "",
          bairro: resposta.endereco?.bairro ?? "",
          cidade: resposta.endereco?.cidade ?? "",
          estado: resposta.endereco?.estado ?? "",
          cep: mascararCep(resposta.endereco?.cep ?? ""),
          pontoReferencia: resposta.endereco?.pontoReferencia ?? "",
        },
      });

      setPossuiLogo(resposta.possuiLogo);

      if (resposta.possuiLogo) {
        try {
          const bytes = await buscarLogoAcademia();
          const base64 = arrayBufferParaBase64(bytes);

          // O endpoint atual do backend retorna JPEG.
          setLogoAtual(`data:image/jpeg;base64,${base64}`);
        } catch {
          setLogoAtual(null);
        }
      } else {
        setLogoAtual(null);
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados da academia.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function atualizarCampo(
    campo: "nome" | "responsavel" | "cnpj",
    valor: string,
  ) {
    setAcademia((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function atualizarEndereco(
    campo: keyof AcademiaRequest["endereco"],
    valor: string,
  ) {
    setAcademia((atual) => ({
      ...atual,
      endereco: {
        ...atual.endereco,
        [campo]: valor,
      },
    }));
  }

  async function salvarDados() {
    setErro("");
    setSucesso("");

    if (!academia.nome.trim()) {
      setErro("Informe o nome da academia.");
      return;
    }

    if (!academia.responsavel.trim()) {
      setErro("Informe o responsável pela academia.");
      return;
    }

    try {
      setSalvando(true);

      const request: AcademiaRequest = {
        ...academia,
        nome: academia.nome.trim(),
        responsavel: academia.responsavel.trim(),
        cnpj: academia.cnpj.replace(/\D/g, ""),
        endereco: {
          ...academia.endereco,
          rua: academia.endereco.rua.trim(),
          numero: academia.endereco.numero.trim(),
          bairro: academia.endereco.bairro.trim(),
          cidade: academia.endereco.cidade.trim(),
          estado: academia.endereco.estado.trim(),
          cep: academia.endereco.cep.replace(/\D/g, ""),
          pontoReferencia: academia.endereco.pontoReferencia.trim(),
        },
      };

      await atualizarAcademia(request);
      setSucesso("Dados da academia atualizados com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar os dados da academia.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function selecionarLogo() {
    try {
      setErro("");
      setSucesso("");

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (resultado.canceled) {
        return;
      }

      const imagem = resultado.assets[0];

      if (!imagem) {
        setErro("Não foi possível selecionar a imagem.");
        return;
      }

      const tipo = imagem.mimeType?.toLowerCase();

      if (tipo && !["image/jpeg", "image/png"].includes(tipo)) {
        setErro("Selecione uma imagem JPG ou PNG.");
        return;
      }

      const tipoImagem = tipo ?? "image/jpeg";
      const extensao = tipoImagem === "image/png" ? "png" : "jpg";

      setLogoSelecionada({
        uri: imagem.uri,
        name: imagem.fileName ?? `logo-academia.${extensao}`,
        type: tipoImagem,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível selecionar a logo.",
      );
    }
  }

  async function salvarLogo() {
    if (!logoSelecionada) {
      setErro("Selecione uma nova logo antes de salvar.");
      return;
    }

    try {
      setErro("");
      setSucesso("");
      setSalvando(true);

      await atualizarLogoAcademia(logoSelecionada);

      // Atualiza a imagem exibida imediatamente com a imagem escolhida.
      setLogoAtual(logoSelecionada.uri);
      setPossuiLogo(true);
      setLogoSelecionada(null);

      setSucesso("Logo da academia atualizada com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a logo.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function campo(
    label: string,
    valor: string,
    onChangeText: (texto: string) => void,
    opcoes?: {
      placeholder?: string;
      teclado?: "default" | "numeric" | "phone-pad";
      maiusculas?: "none" | "sentences" | "words" | "characters";
    },
  ) {
    return (
      <View style={styles.grupoCampo}>
        <Text style={styles.label}>{label}</Text>

        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={onChangeText}
          placeholder={opcoes?.placeholder ?? label}
          placeholderTextColor="#777777"
          keyboardType={opcoes?.teclado ?? "default"}
          autoCapitalize={opcoes?.maiusculas ?? "sentences"}
          editable={!salvando}
        />
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.telaCarregando}>
        <Stack.Screen
          options={{
            title: "Dados da academia",
            headerStyle: { backgroundColor: "#FFFFFF" },
            headerTintColor: "#111111",
          }}
        />

        <ActivityIndicator size="large" color="#C1121F" />
        <Text style={styles.textoCarregando}>
          Carregando dados da academia...
        </Text>
      </View>
    );
  }

  const uriLogoExibida = logoSelecionada?.uri ?? logoAtual;

  return (
    <RotaPermissao permissao="ACADEMIA_EDITAR">
      <>
        <Stack.Screen
          options={{
            title: "Dados da academia",
            headerStyle: { backgroundColor: "#FFFFFF" },
            headerTintColor: "#111111",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />

        <KeyboardAvoidingView
          style={styles.tela}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.titulo}>Dados da academia</Text>

              <Text style={styles.descricao}>
                Atualize a identidade visual e os dados cadastrais da sua
                academia.
              </Text>

              {erro ? (
                <View style={styles.mensagemErro}>
                  <Text style={styles.textoErro}>{erro}</Text>
                </View>
              ) : null}

              {sucesso ? (
                <View style={styles.mensagemSucesso}>
                  <Text style={styles.textoSucesso}>{sucesso}</Text>
                </View>
              ) : null}

              <Text style={styles.secao}>Logo da academia</Text>

              <View style={styles.logoContainer}>
                {uriLogoExibida ? (
                  <Image
                    source={{ uri: uriLogoExibida }}
                    style={styles.logoPreview}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.logoVazio}>
                    <Text style={styles.logoVazioTexto}>
                      {possuiLogo ? "LOGO INDISPONÍVEL" : "SEM LOGO"}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.botaoSecundario}
                  onPress={selecionarLogo}
                  disabled={salvando}
                >
                  <Text style={styles.textoBotaoSecundario}>
                    {uriLogoExibida ? "TROCAR IMAGEM" : "SELECIONAR LOGO"}
                  </Text>
                </TouchableOpacity>

                {logoSelecionada ? (
                  <TouchableOpacity
                    style={[styles.botao, salvando && styles.botaoDesabilitado]}
                    onPress={salvarLogo}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.textoBotao}>SALVAR NOVA LOGO</Text>
                    )}
                  </TouchableOpacity>
                ) : null}

                <Text style={styles.dicaLogo}>
                  Formatos aceitos: JPG e PNG.
                </Text>
              </View>

              <Text style={styles.secao}>Identificação</Text>

              {campo("Nome da academia", academia.nome, (valor) =>
                atualizarCampo("nome", valor),
              )}

              {campo("Responsável", academia.responsavel, (valor) =>
                atualizarCampo("responsavel", valor),
              )}

              {campo(
                "CNPJ",
                academia.cnpj,
                (valor) => atualizarCampo("cnpj", mascararCnpj(valor)),
                { placeholder: "00.000.000/0000-00", teclado: "numeric" },
              )}

              <Text style={styles.secao}>Endereço</Text>

              {campo("Rua", academia.endereco.rua, (valor) =>
                atualizarEndereco("rua", valor),
              )}

              {campo("Número", academia.endereco.numero, (valor) =>
                atualizarEndereco("numero", valor),
              )}

              {campo(
                "CEP",
                academia.endereco.cep,
                (valor) => atualizarEndereco("cep", mascararCep(valor)),
                { placeholder: "00000-000", teclado: "numeric" },
              )}

              {campo("Bairro", academia.endereco.bairro, (valor) =>
                atualizarEndereco("bairro", valor),
              )}

              {campo("Cidade", academia.endereco.cidade, (valor) =>
                atualizarEndereco("cidade", valor),
              )}

              {campo(
                "Estado",
                academia.endereco.estado,
                (valor) => atualizarEndereco("estado", valor),
                { maiusculas: "characters" },
              )}

              {campo(
                "Ponto de referência",
                academia.endereco.pontoReferencia,
                (valor) => atualizarEndereco("pontoReferencia", valor),
              )}

              <Permissao permissao="ACADEMIA_EDITAR" esconder>
                <TouchableOpacity
                  style={[styles.botao, salvando && styles.botaoDesabilitado]}
                  onPress={salvarDados}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.textoBotao}>
                      SALVAR DADOS DA ACADEMIA
                    </Text>
                  )}
                </TouchableOpacity>
              </Permissao>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    </RotaPermissao>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#121212",
  },
  telaCarregando: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  textoCarregando: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 14,
  },
  conteudo: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#303030",
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  descricao: {
    color: "#AAAAAA",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  secao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 16,
  },
  grupoCampo: {
    marginBottom: 16,
  },
  label: {
    color: "#CCCCCC",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#383838",
    borderRadius: 10,
    color: "#FFFFFF",
    paddingHorizontal: 13,
    fontSize: 15,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoPreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#0D0D0D",
    marginBottom: 14,
  },
  logoVazio: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    padding: 10,
  },
  logoVazioTexto: {
    color: "#777777",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  botaoSecundario: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C1121F",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotaoSecundario: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  dicaLogo: {
    color: "#888888",
    fontSize: 12,
    marginTop: 10,
  },
  botao: {
    minHeight: 48,
    backgroundColor: "#C1121F",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  mensagemErro: {
    backgroundColor: "#351719",
    borderWidth: 1,
    borderColor: "#8B252B",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  textoErro: {
    color: "#FF8A8A",
    fontSize: 13,
  },
  mensagemSucesso: {
    backgroundColor: "#16321F",
    borderWidth: 1,
    borderColor: "#28633A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  textoSucesso: {
    color: "#8FE3A5",
    fontSize: 13,
  },
});
