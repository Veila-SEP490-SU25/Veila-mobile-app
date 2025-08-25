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
          title: "Đơn hàng của tôi",
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
          title: "Quản lý ví",
        }}
      />
      <Stack.Screen
        name="topup"
        options={{
          title: "Nạp tiền",
        }}
      />
      <Stack.Screen
        name="transactions"
        options={{
          title: "Lịch sử giao dịch",
        }}
      />
      <Stack.Screen
        name="transaction-detail/[id]"
        options={{
          title: "Chi tiết giao dịch",
        }}
      />
      <Stack.Screen
        name="custom-requests"
        options={{
          title: "Yêu cầu may đo",
        }}
      />
      <Stack.Screen
        name="custom-requests/create"
        options={{
          title: "Tạo yêu cầu may đo",
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
      <Stack.Screen
        name="favorites"
        options={{
          title: "Yêu thích",
        }}
      />
    </Stack>
  );
}
