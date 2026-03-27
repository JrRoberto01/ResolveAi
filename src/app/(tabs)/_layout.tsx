import colors from '@/style/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function TabLayout() {
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
        </Tabs>
    )
}
