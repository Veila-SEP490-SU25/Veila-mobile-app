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
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../../components/Card";
import { LightStatusBar } from "../../../components/StatusBar";
import {
  CustomerOrderResponse,
  orderApi,
} from "../../../services/apis/order.api";
import { formatVNDCustom } from "../../../utils/currency.util";
import { showMessage } from "../../../utils/message.util";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        color: "#F59E0B",
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        label: "Chờ xác nhận",
        icon: "time-outline",
      };
    case "COMPLETED":
      return {
        color: "#10B981",
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        label: "Hoàn thành",
        icon: "checkmark-circle-outline",
      };
    case "CANCELED":
      return {
        color: "#EF4444",
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        label: "Đã hủy",
        icon: "close-circle-outline",
      };
    case "IN_PROCESS":
      return {
        color: "#3B82F6",
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        label: "Đang xử lý",
        icon: "refresh-outline",
      };
    default:
      return {
        color: "#6B7280",
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        label: status,
        icon: "ellipse-outline",
      };
  }
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case "SELL":
      return {
        color: "#E05C78",
        bg: "bg-pink-100",
        label: "Mua váy",
        icon: "shirt-outline",
      };
    case "RENT":
      return {
        color: "#10B981",
        bg: "bg-green-100",
        label: "Thuê váy",
        icon: "repeat-outline",
      };
    case "CUSTOM":
      return {
        color: "#F59E0B",
        bg: "bg-yellow-100",
        label: "Đặt may",
        icon: "cut-outline",
      };
    default:
      return {
        color: "#6B7280",
        bg: "bg-gray-100",
        label: type,
        icon: "bag-outline",
      };
  }
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getOrderById(id as string);
        const orderData = response?.item;
        if (!orderData) {
          showMessage("ERM006", "Không tìm thấy dữ liệu đơn hàng");
          return;
        }
        setOrder(orderData);
      } catch {
        showMessage("ERM006");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LightStatusBar />
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-2xl shadow-sm">
            <ActivityIndicator size="large" color="#E05C78" />
            <Text className="mt-4 text-base text-gray-600 text-center">
              Đang tải chi tiết đơn hàng...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LightStatusBar />
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mx-auto mb-4">
              <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">
              Không tìm thấy đơn hàng
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Đơn hàng này có thể không tồn tại hoặc đã bị xóa
            </Text>
            <TouchableOpacity
              className="bg-primary-500 py-3 px-6 rounded-xl"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold text-center">
                Quay lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(order.status || "PENDING");
  const typeConfig = getTypeConfig(order.type || "SELL");

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

      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Order Header */}
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-3">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${typeConfig.bg}`}
              >
                <Ionicons
                  name={typeConfig.icon as any}
                  size={24}
                  color={typeConfig.color}
                />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  #{order.id?.slice(0, 8) || "N/A"}
                </Text>
                <Text className="text-sm text-gray-600">
                  {typeConfig.label}
                </Text>
              </View>
            </View>

            <View
              className={`px-4 py-2 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              <Text className="text-sm font-medium">{statusConfig.label}</Text>
            </View>
          </View>

          {/* Price Section */}
          <View className="p-4 bg-gray-50 rounded-lg">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Tổng tiền: {formatVNDCustom(order.amount || 0, "₫")}
            </Text>
            <Text className="text-sm text-gray-600">
              Ngày đặt:{" "}
              {order.dueDate
                ? new Date(order.dueDate).toLocaleDateString("vi-VN")
                : "N/A"}
            </Text>
          </View>
        </Card>

        {/* Shop Information */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin shop
          </Text>
          <View className="flex-row items-center space-x-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
              <Ionicons name="business" size={20} color="#E05C78" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">
                {order.shopName || "N/A"}
              </Text>
              <Text className="text-sm text-gray-600">Cửa hàng</Text>
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
                {order.customerName || "N/A"}
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
                {order.dueDate
                  ? new Date(order.dueDate).toLocaleDateString("vi-VN")
                  : "N/A"}
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
              <Text className="text-gray-600">Mua lại:</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
