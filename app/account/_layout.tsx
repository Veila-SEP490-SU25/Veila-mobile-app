import { Stack } from "expo-router";
import React from "react";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: "Chỉnh sửa hồ sơ",
        }}
      />
      <Stack.Screen
        name="address"
        options={{
          title: "Địa chỉ giao hàng",
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
        }}
      />
      <Stack.Screen
        name="order/[id]"
        options={{
          title: "Chi tiết đơn hàng",
        }}
      />
      <Stack.Screen
        name="wallet"
        options={{
          title: "Ví điện tử",
        }}
      />
      <Stack.Screen
        name="topup"
        options={{
          title: "Nạp tiền",
        }}
      />
      <Stack.Screen
        name="custom-requests"
        options={{
          title: "Yêu cầu đặt may",
        }}
      />
      <Stack.Screen
        name="custom-requests/create"
        options={{
          title: "Tạo yêu cầu mới",
        }}
      />
      <Stack.Screen
        name="custom-requests/[id]"
        options={{
          title: "Chi tiết yêu cầu",
        }}
      />
      <Stack.Screen
        name="custom-requests/[id]/edit"
        options={{
          title: "Chỉnh sửa yêu cầu",
        }}
      />
    </Stack>
  );
}
