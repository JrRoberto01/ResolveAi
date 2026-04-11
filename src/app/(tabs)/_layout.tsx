import { useAuth } from '@/contexts/AuthContext';
import palette from '@/style/colors';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from "expo-router";

export default function TabLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

    return (
        <Tabs>
            <Tabs.Screen name="index"
                options={{
                    title: 'Feed',
                    tabBarActiveTintColor: `${palette.darkBlue}`,
                    tabBarInactiveTintColor: `${palette.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="list" size={24} color={palette.darkGrey} />,
                }}
            />
            <Tabs.Screen name="ranking"
                options={{
                    title: 'Ranking',
                    tabBarActiveTintColor: `${palette.darkBlue}`,
                    tabBarInactiveTintColor: `${palette.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="trophy-outline" size={24} color={palette.darkGrey} />,
                }}
            />
            <Tabs.Screen name="favorites"
                options={{
                    title: 'Favoritos',
                    tabBarActiveTintColor: `${palette.darkBlue}`,
                    tabBarInactiveTintColor: `${palette.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="heart-outline" size={24} color={palette.darkGrey} />,
                }}
            />
            <Tabs.Screen name="profile"
                options={{
                    title: 'Perfil',
                    tabBarActiveTintColor: `${palette.darkBlue}`,
                    tabBarInactiveTintColor: `${palette.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="person-outline" size={24} color={palette.darkGrey} />,
                }}
            />
        </Tabs>
    )
}

