import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";

export default function RootLayout() {
    return (
        <GestureHandlerRootView>
            <AuthProvider>
                <FavoritesProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </FavoritesProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
