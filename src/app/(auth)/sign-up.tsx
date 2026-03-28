import NoticeModal from "@/components/NoticeModal/NoticeModal";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/style/colors";
import { globalStyles } from "@/style/global";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ModalState = {
    visible: boolean;
    title: string;
    message: string;
    variant: "info" | "success" | "warning" | "error";
    primaryAction: {
        label: string;
        onPress: () => void;
        variant?: "primary" | "secondary" | "danger";
    };
    secondaryAction?: {
        label: string;
        onPress: () => void;
        variant?: "primary" | "secondary" | "danger";
    };
};

const hiddenModalState: ModalState = {
    visible: false,
    title: "",
    message: "",
    variant: "info",
    primaryAction: {
        label: "Fechar",
        onPress: () => undefined,
    },
};

export default function Signup() {
    const { signUp, signIn, enableBiometricLogin, isBiometricAvailable, isBiometricEnabled } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>(hiddenModalState);

    function closeModal() {
        setModal(hiddenModalState);
    }

    function navigateToTabs() {
        closeModal();
        router.replace("/(tabs)");
    }

    function showErrorModal(message: string) {
        setModal({
            visible: true,
            title: "Algo deu errado",
            message,
            variant: "error",
            primaryAction: {
                label: "Entendi",
                onPress: closeModal,
            },
        });
    }

    function askToEnableBiometrics() {
        if (!isBiometricAvailable || isBiometricEnabled) {
            router.replace("/(tabs)");
            return;
        }

        setModal({
            visible: true,
            title: "Ativar login com biometria?",
            message: "Sua conta foi criada. Deseja liberar os proximos acessos com a biometria do dispositivo?",
            variant: "info",
            primaryAction: {
                label: "Ativar",
                onPress: () => {
                    void (async () => {
                        try {
                            closeModal();
                            const enabled = await enableBiometricLogin();

                            if (enabled) {
                                setModal({
                                    visible: true,
                                    title: "Tudo certo",
                                    message: "Login com biometria ativado com sucesso.",
                                    variant: "success",
                                    primaryAction: {
                                        label: "Continuar",
                                        onPress: navigateToTabs,
                                    },
                                });
                                return;
                            }

                            router.replace("/(tabs)");
                        } catch (err: any) {
                            const msg =
                                err?.message ||
                                "Nao foi possivel ativar o login com biometria.";

                            setModal({
                                visible: true,
                                title: "Nao foi possivel ativar",
                                message: msg,
                                variant: "error",
                                primaryAction: {
                                    label: "Continuar",
                                    onPress: navigateToTabs,
                                },
                            });
                        }
                    })();
                },
            },
            secondaryAction: {
                label: "Agora nao",
                variant: "secondary",
                onPress: navigateToTabs,
            },
        });
    }

    async function handleSignUp() {
        try {
            setLoading(true);
            await signUp({ name: name.trim(), email: email.trim(), password });
            await signIn({ email: email.trim(), password });

            setModal({
                visible: true,
                title: "Bem-vindo!",
                message: isBiometricAvailable && !isBiometricEnabled
                    ? "Sua conta foi criada com sucesso. Deseja ativar o login com biometria agora?"
                    : "Sua conta foi criada com sucesso.",
                variant: "success",
                primaryAction: isBiometricAvailable && !isBiometricEnabled
                    ? {
                        label: "Ativar biometria",
                        onPress: askToEnableBiometrics,
                    }
                    : {
                        label: "Continuar",
                        onPress: navigateToTabs,
                    },
                secondaryAction: isBiometricAvailable && !isBiometricEnabled
                    ? {
                        label: "Agora nao",
                        variant: "secondary",
                        onPress: navigateToTabs,
                    }
                    : undefined,
            });
        } catch (err: any) {
            const msg =
                err?.response?.data?.message?.toString?.() ||
                err?.message ||
                "Falha ao cadastrar.";
            showErrorModal(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={[globalStyles.container, {justifyContent: 'center'}]}>
            {/*Precisamos colocar a imagem do app aqui*/}
            <TextInput
                style={style.input}
                placeholder="Digite seu nome"
                placeholderTextColor="#8B90A0"
                autoCapitalize="words"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                editable={!loading}
            />
            <TextInput
                style={style.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#8B90A0"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
            />
            <TextInput
                style={style.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#8B90A0"
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />
            <Pressable style={style.btn} onPress={handleSignUp} disabled={loading}>
                <Text style={style.btnText}>{loading ? "Criando conta..." : "Criar conta"}</Text>
            </Pressable>

            <Text style={style.linkText}>Ja possui uma conta?<Link href="/(auth)/sign-in" style={style.linkStrong}> Entre agora</Link></Text>

            <NoticeModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                variant={modal.variant}
                primaryAction={modal.primaryAction}
                secondaryAction={modal.secondaryAction}
                onRequestClose={closeModal}
            />
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: colors.darkGrey,
        backgroundColor: colors.white,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 2,
        color: colors.black,
    },
    btn: {
        backgroundColor: colors.darkBlue,
        padding: 14,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    btnText: {
        color: colors.white,
        fontWeight: "700",
    },
    linkText: {
        marginTop: 30,
        textAlign: "center",
        color: colors.black,
    },
    linkStrong: {
        fontWeight: "bold",
        color: colors.darkBlue
    },
});
