import { useAuth } from '@/contexts/AuthContext';
import colors from '@/style/colors';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Redirect, router, Tabs } from "expo-router";
import { TouchableOpacity } from 'react-native';

export default function TabLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;

    const BackButton = () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
            <FontAwesome5 name="arrow-left" size={24} color="#323232" />
        </TouchableOpacity>
    );

    return (
        <Tabs>
            <Tabs.Screen name="index"
                options={{
                    title: 'Feed',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="list" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="ranking"
                options={{
                    title: 'Ranking',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="trophy-outline" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="favorites"
                options={{
                    title: 'Favoritos',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="heart-outline" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="profile"
                options={{
                    title: 'Perfil',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <Ionicons name="person-outline" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="add" options={{ href: null }} />
            <Tabs.Screen name="list" options={{ href: null }} />
            <Tabs.Screen name="profile.data" options={{ href: null }} />
        </Tabs>
    )
}
