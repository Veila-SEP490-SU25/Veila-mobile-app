import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="orders" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ headerShown: false }} />
      <Stack.Screen name="custom-requests" options={{ headerShown: false }} />
      <Stack.Screen
        name="custom-requests/create"
        options={{ headerShown: false }}
      />{" "}
      <Stack.Screen
        name="custom-requests/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="custom-requests/[id]/edit"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
