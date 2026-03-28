import { styles } from "@/style/global";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Feed</Text>
    </SafeAreaView>
  );
}
