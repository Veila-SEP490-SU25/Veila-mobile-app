import { Stack } from "expo-router";

export default function DressesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="buy"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rent"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
