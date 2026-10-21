import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MenuItem from "@/components/MenuItem";
import { logout } from "@/services/authService";
import { obterPermissoes } from "@/services/permissions";

import {
  consultarStatusLicenca,
  type LicencaStatusResponse,
} from "@/services/licencaStatusService";

import { buscarLogoAcademia } from "@/services/academiaService";

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

export default function MenuScreen() {
  const router = useRouter();

  const [permissoes, setPermissoes] = useState<string[]>([]);

  const [statusLicenca, setStatusLicenca] =
    useState<LicencaStatusResponse | null>(null);

  const [logoFundo, setLogoFundo] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarLogoFundo() {
        try {
          const buffer = await buscarLogoAcademia();
          const base64 = arrayBufferParaBase64(buffer);

          if (ativo) {
            setLogoFundo(`data:image/jpeg;base64,${base64}`);
          }
        } catch (error) {
          console.error("Não foi possível carregar a logo de fundo:", error);
        }
      }

      carregarLogoFundo();

      return () => {
        ativo = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          confirmarSaida();
          return true;
        },
      );

      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    async function carregarStatusLicenca() {
      try {
        const status = await consultarStatusLicenca();
        setStatusLicenca(status);
      } catch (error) {
        console.error("Erro ao consultar status da licença:", error);
      }
    }

    carregarStatusLicenca();
  }, []);

  useEffect(() => {
    async function carregarPermissoes() {
      const resultado = await obterPermissoes();

      setPermissoes(resultado);
    }

    carregarPermissoes();
  }, []);

  function pode(permissao: string) {
    return permissoes.includes(permissao);
  }

  function confirmarSaida() {
    Alert.alert("Sair", "Deseja realmente sair do sistema?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: executarSaida,
      },
    ]);
  }

  async function executarSaida() {
    await logout();

    router.replace("/(tabs)");
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "BlackBelt",
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: "#0A0A0A",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            color: "#FFFFFF",
            fontWeight: "800",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={confirmarSaida}
              accessibilityRole="button"
              accessibilityLabel="Sair do sistema"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                ←
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      {logoFundo ? (
        <Image
          source={{ uri: logoFundo }}
          style={styles.logoFundo}
          resizeMode="cover"
          pointerEvents="none"
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.logoMarca}>
            <Text style={styles.logoMarcaTexto}>B</Text>
          </View>

          <View style={styles.logoContainer}>
            <Text style={styles.logo}>BLACKBELT</Text>
            <Text style={styles.subtitulo}>GESTÃO PARA ACADEMIAS</Text>
          </View>
        </View>

        {statusLicenca && (
          <View
            style={[
              styles.licencaCard,
              statusLicenca.situacao === "LICENCIADA"
                ? styles.licencaAtiva
                : statusLicenca.situacao === "AVALIACAO"
                  ? styles.licencaAvaliacao
                  : styles.licencaExpirada,
            ]}
          >
            <Text style={styles.licencaTitulo}>
              {statusLicenca.situacao === "LICENCIADA"
                ? "Licença comercial ativa"
                : statusLicenca.situacao === "AVALIACAO"
                  ? "Cópia de avaliação"
                  : "Licença expirada"}
            </Text>

            {statusLicenca.dataExpiracao ? (
              <Text style={styles.licencaTexto}>
                Válida até{" "}
                {new Date(
                  `${statusLicenca.dataExpiracao}T12:00:00`,
                ).toLocaleDateString("pt-BR")}
              </Text>
            ) : null}

            {statusLicenca.situacao !== "EXPIRADA" ? (
              <Text style={styles.licencaTexto}>
                {statusLicenca.diasRestantes}{" "}
                {statusLicenca.diasRestantes === 1
                  ? "dia restante"
                  : "dias restantes"}
              </Text>
            ) : null}
          </View>
        )}

        {/* TÍTULO */}
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Menu</Text>
          <Text style={styles.descricao}>
            Acesse os recursos da sua academia
          </Text>
        </View>

        {/* CADASTROS */}
        <Text style={styles.secao}>GESTÃO</Text>

        {pode("ALUNO_LISTAR") && (
          <MenuItem titulo="Alunos" onPress={() => router.push("/alunos")} />
        )}

        {pode("PROFESSOR_LISTAR") && (
          <MenuItem
            titulo="Professores"
            onPress={() => router.push("/professores")}
          />
        )}

        {pode("MODALIDADE_LISTAR") && (
          <MenuItem
            titulo="Modalidades"
            onPress={() => router.push("/modalidades")}
          />
        )}

        {pode("TURMA_LISTAR") && (
          <MenuItem titulo="Turmas" onPress={() => router.push("/turmas")} />
        )}

        {pode("MATRICULA_LISTAR") && (
          <MenuItem
            titulo="Matrículas"
            onPress={() => router.push("/matriculas")}
          />
        )}

        {pode("PRESENCA_LISTAR") && (
          <MenuItem
            titulo="Presenças"
            onPress={() => router.push("/presencas")}
          />
        )}

        {/* FINANCEIRO */}
        {(pode("TIPO_COBRANCA_LISTAR") || pode("COBRANCA_LISTAR")) && (
          <>
            <Text style={styles.secao}>FINANCEIRO</Text>

            <MenuItem
              titulo="Financeiro"
              onPress={() => router.push("/financeiro")}
            />
          </>
        )}

        {/* CONTA */}
        <Text style={styles.secao}>CONTA</Text>

        {pode("ACADEMIA_EDITAR") && (
          <MenuItem
            titulo="Dados da Academia"
            onPress={() => router.push("/dados-academia")}
          />
        )}

        <MenuItem
          titulo="Alterar senha"
          onPress={() => router.push("/alterar-senha")}
        />

        {/* ADMINISTRAÇÃO */}
        {(pode("USUARIO_LISTAR") || pode("PERFIL_LISTAR")) && (
          <>
            <Text style={styles.secao}>ADMINISTRAÇÃO</Text>

            <MenuItem
              titulo="Administração"
              onPress={() => router.push("/administracao")}
            />
          </>
        )}

        {/* SAIR */}
        <View style={styles.saidaContainer}>
          <TouchableOpacity
            style={styles.botaoSair}
            activeOpacity={0.8}
            onPress={confirmarSaida}
          >
            <Text style={styles.textoSair}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>
            BLACKBELT • GESTÃO PARA ACADEMIAS
          </Text>
          <Text style={styles.footerVersao}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  logoFundo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  // HEADER

  header: {
    alignItems: "center",
    marginBottom: 38,
  },

  logoMarca: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#C1121F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  logoMarcaTexto: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },

  logoContainer: {
    alignItems: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 3,
  },

  subtitulo: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    marginTop: 5,
  },

  // LICENÇA

  licencaCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 5,
  },

  licencaAtiva: {
    backgroundColor: "#102018",
    borderColor: "#285B3B",
  },

  licencaAvaliacao: {
    backgroundColor: "#211B0D",
    borderColor: "#70551B",
  },

  licencaExpirada: {
    backgroundColor: "#211315",
    borderColor: "#472126",
  },

  licencaTitulo: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  licencaTexto: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 19,
  },

  // TÍTULO

  tituloContainer: {
    marginBottom: 24,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  descricao: {
    color: "#777777",
    fontSize: 14,
    marginTop: 5,
  },

  // SEÇÕES

  secao: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 18,
    marginBottom: 10,
  },

  // SAÍDA

  saidaContainer: {
    marginTop: 28,
  },

  botaoSair: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A1719",
    backgroundColor: "#160D0E",
    alignItems: "center",
    justifyContent: "center",
  },

  textoSair: {
    color: "#E04B55",
    fontSize: 16,
    fontWeight: "700",
  },

  // FOOTER

  footer: {
    alignItems: "center",
    marginTop: 35,
  },

  footerTexto: {
    color: "#444444",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  footerVersao: {
    color: "#333333",
    fontSize: 10,
    marginTop: 5,
  },
});
