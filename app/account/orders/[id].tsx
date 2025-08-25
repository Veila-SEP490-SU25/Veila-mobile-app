import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import { LightStatusBar } from "../../../components/StatusBar";
import {
  CustomerOrderResponse,
  orderApi,
} from "../../../services/apis/order.api";
import { formatVNDCustom } from "../../../utils/currency.util";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await orderApi.getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, loadOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROCESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "IN_PROCESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "SELL":
        return "Mua váy";
      case "RENT":
        return "Thuê váy";
      case "CUSTOM":
        return "Đặt may";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SELL":
        return "shirt";
      case "RENT":
        return "repeat";
      case "CUSTOM":
        return "cut";
      default:
        return "bag";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELL":
        return "#E05C78";
      case "RENT":
        return "#10B981";
      case "CUSTOM":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LightStatusBar />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LightStatusBar />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4">
            Không tìm thấy đơn hàng
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Đơn hàng này có thể không tồn tại hoặc đã bị xóa
          </Text>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            className="mt-6"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LightStatusBar />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            Chi tiết đơn hàng
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Order Header */}
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: getTypeColor(order.type || "BUY") + "20",
                }}
              >
                <Ionicons
                  name={getTypeIcon(order.type || "BUY") as any}
                  size={24}
                  color={getTypeColor(order.type || "BUY")}
                />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  #{order.id?.slice(0, 8) || "N/A"}
                </Text>
                <Text className="text-sm text-gray-600">
                  {getTypeText(order.type || "BUY")}
                </Text>
              </View>
            </View>

            <View
              className={`px-4 py-2 rounded-full border ${getStatusColor(order.status || "PENDING")}`}
            >
              <Text className="text-sm font-medium">
                {getStatusText(order.status || "PENDING")}
              </Text>
            </View>
          </View>

          {/* Order Summary */}
          <View className="p-4 bg-gray-50 rounded-lg">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Tổng tiền: {formatVNDCustom(order.amount || 0, "₫")}
            </Text>
            <Text className="text-sm text-gray-600">
              Ngày đặt:{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </Text>
          </View>
        </Card>

        {/* Shop Information */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin shop
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="business" size={20} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-800">
                  {order.shopName || "N/A"}
                </Text>
                <Text className="text-sm text-gray-600">
                  {order.shop?.address || "N/A"}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">
                {order.shop?.phone || "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">
                {order.shop?.email || "N/A"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Customer Information */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin khách hàng
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="person" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">
                {order.customer?.firstName || ""}{" "}
                {order.customer?.middleName || ""}{" "}
                {order.customer?.lastName || ""}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">
                {order.phone || "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">
                {order.email || "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600">
                {order.address || "N/A"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Chi tiết đơn hàng
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Ngày giao hàng:</Text>
              <Text className="text-gray-800 font-medium">
                {new Date(order.dueDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            {order.returnDate && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Ngày trả hàng:</Text>
                <Text className="text-gray-800 font-medium">
                  {new Date(order.returnDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Trạng thái:</Text>
              <View
                className={`px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
              >
                <Text className="text-xs font-medium">
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="mb-6 space-y-3">
          {order.status === "PENDING" && (
            <Button
              title="Hủy đơn hàng"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Hủy đơn hàng",
                  text2: "Tính năng này sẽ được cập nhật sau",
                });
              }}
              variant="danger"
              icon="close-circle-outline"
              fullWidth
            />
          )}

          <Button
            title="Liên hệ shop"
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Liên hệ shop",
                text2: "Tính năng này sẽ được cập nhật sau",
              });
            }}
            variant="outline"
            icon="chatbubble-outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
