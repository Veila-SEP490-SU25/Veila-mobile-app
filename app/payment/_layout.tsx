import { Stack } from "expo-router";
import React from "react";

export default function PaymentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen
        name="checkout"
        options={{
          title: "Thanh toán",
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          title: "Thanh toán thành công",
        }}
      />
      <Stack.Screen
        name="failure"
        options={{
          title: "Thanh toán thất bại",
        }}
      />
    </Stack>
  );
}
