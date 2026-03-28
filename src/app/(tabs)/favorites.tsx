import { styles } from "@/style/global";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Favorites(){
    return(
        <SafeAreaView style={styles.container}>
            <Text>Favorite</Text>
        </SafeAreaView>
    )
}