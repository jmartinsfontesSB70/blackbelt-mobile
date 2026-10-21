import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
  cadastrarAcademia,
  verificarStatusInstalacao,
  type AcademiaRequest,
} from "@/services/academiaService";

const enderecoInicial = {
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  pontoReferencia: "",
};

const academiaInicial: AcademiaRequest = {
  nome: "",
  responsavel: "",
  cnpj: "",
  endereco: { ...enderecoInicial },
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

export default function InstalacaoScreen() {
  const router = useRouter();

  const [academia, setAcademia] = useState<AcademiaRequest>(academiaInicial);

  const [logo, setLogo] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [dataExpiracao, setDataExpiracao] = useState("");

  useEffect(() => {
    async function verificarInstalacao() {
      try {
        const status = await verificarStatusInstalacao();

        if (status.academiaCadastrada) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível verificar a instalação.",
        );
      } finally {
        setCarregando(false);
      }
    }

    verificarInstalacao();
  }, [router]);

  function alterarCampo(
    campo: Exclude<keyof AcademiaRequest, "endereco">,
    valor: string,
  ) {
    setAcademia((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function alterarEndereco(
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

  async function selecionarLogo() {
    try {
      setErro("");

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

      if (
        imagem.mimeType &&
        !["image/jpeg", "image/png"].includes(imagem.mimeType)
      ) {
        setErro("Selecione uma imagem JPG, JPEG ou PNG.");
        return;
      }

      const tipo = imagem.mimeType ?? "image/jpeg";
      const extensao = tipo === "image/png" ? "png" : "jpg";
      const nomeArquivo = imagem.fileName ?? `logo-academia.${extensao}`;

      setLogo({
        uri: imagem.uri,
        name: nomeArquivo,
        type: tipo,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível selecionar o logo.",
      );
    }
  }

  async function cadastrar() {
    const camposObrigatorios = [
      academia.nome,
      academia.responsavel,
      academia.endereco.rua,
      academia.endereco.numero,
      academia.endereco.bairro,
      academia.endereco.cidade,
      academia.endereco.estado,
      academia.endereco.cep,
    ];

    if (camposObrigatorios.some((valor) => !valor.trim())) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setErro("");
      setEnviando(true);

      const academiaSemMascara: AcademiaRequest = {
        ...academia,
        cnpj: academia.cnpj.replace(/\D/g, ""),
      };

      const resposta = await cadastrarAcademia(
        academiaSemMascara,
        logo ?? undefined,
      );

      setDataExpiracao(resposta.dataExpiracao);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a academia.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function campo(
    rotulo: string,
    valor: string,
    onChangeText: (texto: string) => void,
    obrigatorio = true,
    opcoes: {
      teclado?: "default" | "numeric";
      maxLength?: number;
      maiusculas?: boolean;
    } = {},
  ) {
    return (
      <View style={styles.campo} key={rotulo}>
        <Text style={styles.label}>
          {rotulo}
          {obrigatorio ? " *" : ""}
        </Text>

        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={onChangeText}
          placeholder={rotulo}
          placeholderTextColor="#777"
          keyboardType={opcoes.teclado ?? "default"}
          maxLength={opcoes.maxLength}
          autoCapitalize={opcoes.maiusculas ? "characters" : "sentences"}
          editable={!enviando}
        />
      </View>
    );
  }

  function formatarData(data: string) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#C1121F" />
        <Text style={styles.textoAuxiliar}>
          Verificando instalação do BlackBelt...
        </Text>
      </View>
    );
  }

  if (dataExpiracao) {
    return (
      <View style={styles.centralizado}>
        <View style={styles.card}>
          <Text style={styles.logoTexto}>BLACKBELT</Text>
          <Text style={styles.titulo}>Academia cadastrada!</Text>

          <Text style={styles.sucesso}>
            O cadastro foi realizado com sucesso.
          </Text>

          <Text style={styles.texto}>
            Sua avaliação termina em{" "}
            <Text style={styles.destaque}>{formatarData(dataExpiracao)}</Text>.
          </Text>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.textoBotao}>IR PARA O LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={40}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      keyboardOpeningTime={0}
      enableResetScrollToCoords={false}
      extraHeight={20}
      viewIsInsideTabBar={false}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
    >
      <View style={styles.cabecalho}>
        <Text style={styles.logoTexto}>BLACKBELT</Text>
        <Text style={styles.subtitulo}>Vamos configurar sua academia!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.secao}>Dados da academia</Text>

        <Text style={styles.label}>Logo da academia</Text>

        <View style={styles.logoContainer}>
          {logo ? (
            <Image
              source={{ uri: logo.uri }}
              style={styles.logoPreview}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoVazio}>
              <Text style={styles.logoVazioTexto}>LOGO</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.botaoLogo}
            onPress={selecionarLogo}
            disabled={enviando}
          >
            <Text style={styles.textoBotao}>
              {logo ? "TROCAR LOGO" : "SELECIONAR LOGO"}
            </Text>
          </TouchableOpacity>
        </View>

        {campo("Nome da academia", academia.nome, (v) =>
          alterarCampo("nome", v),
        )}

        {campo("Responsável", academia.responsavel, (v) =>
          alterarCampo("responsavel", v),
        )}

        {campo(
          "CNPJ",
          academia.cnpj,
          (v) => alterarCampo("cnpj", mascararCnpj(v)),
          false,
          {
            teclado: "numeric",
            maxLength: 18,
          },
        )}

        <Text style={styles.secao}>Endereço</Text>

        {campo("Rua", academia.endereco.rua, (v) => alterarEndereco("rua", v))}

        {campo("Número", academia.endereco.numero, (v) =>
          alterarEndereco("numero", v),
        )}

        {campo(
          "CEP",
          academia.endereco.cep,
          (v) => alterarEndereco("cep", mascararCep(v)),
          true,
          {
            teclado: "numeric",
            maxLength: 9,
          },
        )}

        {campo("Bairro", academia.endereco.bairro, (v) =>
          alterarEndereco("bairro", v),
        )}

        {campo("Cidade", academia.endereco.cidade, (v) =>
          alterarEndereco("cidade", v),
        )}

        {campo(
          "Estado (UF)",
          academia.endereco.estado,
          (v) => alterarEndereco("estado", v.toUpperCase()),
          true,
          { maxLength: 2, maiusculas: true },
        )}

        {campo(
          "Ponto de referência",
          academia.endereco.pontoReferencia,
          (v) => alterarEndereco("pontoReferencia", v),
          false,
        )}

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[styles.botao, enviando && styles.botaoDesabilitado]}
          onPress={cadastrar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>CADASTRAR ACADEMIA</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.aviso}>
          A avaliação de 14 dias começa após o cadastro.
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
  },

  centralizado: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0A0A0A",
  },

  cabecalho: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoTexto: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 10,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 18,
  },

  subtitulo: {
    color: "#999999",
    fontSize: 14,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#292929",
  },

  secao: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 16,
  },

  campo: {
    marginBottom: 16,
  },

  label: {
    color: "#CCCCCC",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    minHeight: 50,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  logoPreview: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#0D0D0D",
    marginBottom: 14,
  },

  logoVazio: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#303030",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  logoVazioTexto: {
    color: "#777777",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
  },

  botaoLogo: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C1121F",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  botao: {
    minHeight: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C1121F",
    marginTop: 8,
    paddingHorizontal: 12,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  texto: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 20,
  },

  textoAuxiliar: {
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: 14,
  },

  destaque: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  sucesso: {
    color: "#6EE7A0",
    fontSize: 15,
    marginBottom: 16,
  },

  erro: {
    color: "#F08A91",
    backgroundColor: "#211315",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    overflow: "hidden",
  },

  aviso: {
    color: "#999999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
});
