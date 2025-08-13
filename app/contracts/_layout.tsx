import { Stack } from "expo-router";

export default function ContractsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="customer" options={{ headerShown: false }} />
    </Stack>
  );
}
