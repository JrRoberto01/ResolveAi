import colors from '@/style/colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
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
                    tabBarIcon: () => <FontAwesome5 name="home" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="ranking"
                options={{
                    title: 'Ranking',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <FontAwesome5 name="trophy" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="favorites"
                options={{
                    title: 'Favoritos',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <FontAwesome5 name="star" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="profile"
                options={{
                    title: 'Perfil',
                    tabBarActiveTintColor: `${colors.darkBlue}`,
                    tabBarInactiveTintColor: `${colors.darkGrey}`,
                    headerShown: false,
                    tabBarIcon: () => <FontAwesome5 name="user" size={24} color={colors.darkGrey} />,
                }}
            />
            <Tabs.Screen name="add" options={{ href: null }} />
            <Tabs.Screen name="list" options={{ href: null }} />
        </Tabs>
    )
}
