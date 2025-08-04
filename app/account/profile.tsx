import { StatusBar, StyleSheet, Text, View } from "react-native";
import { useTokenCheck } from "../../hooks/useTokenCheck";

export default function Profile() {
  useTokenCheck();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Text style={styles.title}>Thông báo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
  },
});
