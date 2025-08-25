import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "nativewind";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { Provider as ReduxProvider } from "react-redux";
import { toastConfig } from "styles/toast.config";
import { AuthProvider } from "../providers/auth.provider";
import { ChatProvider } from "../providers/chat.provider";

import { store } from "services/store";
import "../styles/global.css";
import SessionProvider from "./context/SessionContext";

// Configure Reanimated to reduce warnings
import "../utils/reanimated.config";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Regular.ttf"),
  });

  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.preventAutoHideAsync();

      if (fontsLoaded) {
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 500);
      }
    };

    prepare();
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <ReduxProvider store={store}>
      <SessionProvider>
        <AuthProvider>
          <ChatProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="not-found" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="_tab" options={{ headerShown: false }} />
              <Stack.Screen name="_auth" options={{ headerShown: false }} />
              <Stack.Screen
                name="_onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="account" options={{ headerShown: false }} />
              <Stack.Screen name="payment" options={{ headerShown: false }} />
            </Stack>
            <Toast
              config={toastConfig}
              position="bottom"
              bottomOffset={100}
              visibilityTime={3000}
              autoHide={true}
            />
          </ChatProvider>
        </AuthProvider>
      </SessionProvider>
    </ReduxProvider>
  );
}
