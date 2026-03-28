import { useAuth } from "@/contexts/AuthContext";
import colors from "@/style/colors";
import { styles } from "@/style/global";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile(){
    const { signOut } = useAuth();

    async function handleSignOut() {
        await signOut();
        router.replace("/(auth)/sign-in");
    }

    return(
        <SafeAreaView style={styles.container}>
            <Pressable onPress={handleSignOut} style={style.btn}><Text style={{color: colors.white}}>Sair</Text></Pressable>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    btn:{
        backgroundColor: colors.darkBlue,
        padding: 12,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    }
})