import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "nativewind";
import Toast from "react-native-toast-message";
import { Provider as ReduxProvider } from "react-redux";
import { toastConfig } from "styles/toast.config";
import { AuthProvider } from "../providers/auth.provider";
import store from "../services/store";
import "../styles/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="not-found" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <Toast config={toastConfig} position="top" topOffset={60} />
      </AuthProvider>
    </ReduxProvider>
  );
}
