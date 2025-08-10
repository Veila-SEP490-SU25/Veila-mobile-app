import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { orderApi } from "../../../services/apis/order.api";
import { Order } from "../../../services/types/order.type";

const statusColor = {
  PENDING: "#F59E0B",
  COMPLETED: "#10B981",
  CANCELED: "#EF4444",
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderApi
      .getOrderById(id as string)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="mt-4 text-base text-gray-500">
          Đang tải chi tiết đơn hàng...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <Text className="text-lg text-gray-500">Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white shadow-sm z-10">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-primary-100 justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-primary-600 ml-2">
          Chi tiết đơn hàng
        </Text>
        <View className="w-10" />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 pb-10">
          <View className="flex-row items-center mb-4">
            <Ionicons name="cube-outline" size={28} color="#E05C78" />
            <Text className="ml-3 text-xl font-bold text-primary-600">
              {order.shopName}
            </Text>
          </View>
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-1">
              Khách hàng:{" "}
              <Text className="font-normal">{order.customerName}</Text>
            </Text>
            <Text className="text-base font-semibold text-gray-700 mb-1">
              Số điện thoại: <Text className="font-normal">{order.phone}</Text>
            </Text>
            <Text className="text-base font-semibold text-gray-700 mb-1">
              Email: <Text className="font-normal">{order.email}</Text>
            </Text>
            <Text className="text-base font-semibold text-gray-700 mb-1">
              Địa chỉ: <Text className="font-normal">{order.address}</Text>
            </Text>
          </View>
          <View className="mb-4 flex-row items-center">
            <Ionicons name="pricetag-outline" size={20} color="#E05C78" />
            <Text className="ml-2 text-lg text-primary-600 font-bold">
              {order.amount.toLocaleString()}đ
            </Text>
          </View>
          <View className="mb-4 flex-row items-center">
            <Ionicons
              name="ellipse"
              size={14}
              color={
                statusColor[order.status as keyof typeof statusColor] || "#999"
              }
            />
            <Text
              className="ml-2 text-base font-semibold"
              style={{
                color:
                  statusColor[order.status as keyof typeof statusColor] ||
                  "#999",
              }}
            >
              {order.status}
            </Text>
          </View>
          <View className="mb-4">
            <Text className="text-base text-gray-700">
              Ngày nhận: <Text className="font-semibold">{order.dueDate}</Text>
            </Text>
            <Text className="text-base text-gray-700">
              Ngày trả:{" "}
              <Text className="font-semibold">{order.returnDate}</Text>
            </Text>
            <Text className="text-base text-gray-700">
              Loại đơn:{" "}
              <Text className="font-semibold">
                {order.type === "SELL" ? "Mua" : "Thuê"}
              </Text>
            </Text>
            <Text className="text-base text-gray-700">
              Mua lại:{" "}
              <Text className="font-semibold">
                {order.isBuyBack ? "Có" : "Không"}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
