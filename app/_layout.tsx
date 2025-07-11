import store from "@/services/store";
import { Stack } from "expo-router";
import "nativewind";
import React from "react";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../styles/global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="not-found" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </>
    </Provider>
  );
}
