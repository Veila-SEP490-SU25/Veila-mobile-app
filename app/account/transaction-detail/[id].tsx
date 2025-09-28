import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  transactionApi,
  TransactionItem,
} from "../../../services/apis/transaction.api";
import { formatVND } from "../../../utils/currency.util";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState<TransactionItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTransactionDetail = async () => {
    try {
      setLoading(true);
      const response = await transactionApi.getTransactionDetail(id as string);

      if (response.statusCode === 200) {
        setTransaction(response.item);
        console.log("✅ Transaction detail loaded:", response.item);
      } else {
        console.log("❌ API Error:", response);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải chi tiết giao dịch",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("🚨 Exception:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải chi tiết giao dịch",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTransactionDetail();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      COMPLETED: "#10B981",
      PENDING: "#F59E0B",
      FAILED: "#EF4444",
    };
    return statusColors[status] || "#6B7280";
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      COMPLETED: "Hoàn thành",
      PENDING: "Đang xử lý",
      FAILED: "Thất bại",
    };
    return statusLabels[status] || status;
  };

  const getOrderTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      SELL: "Mua váy",
      RENT: "Thuê váy",
      CUSTOM: "Đặt may",
    };
    return typeLabels[type] || type;
  };

  const formatShopName = (shopName: string) => {
    return shopName.replace(/_shop_\d+$/, "").replace(/_/g, " ");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">
            Đang tải chi tiết giao dịch...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="document-text-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            Không thể tải chi tiết giao dịch
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-6 mt-4"
            onPress={loadTransactionDetail}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOutgoing = transaction.fromTypeBalance === "AVAILABLE";
  const statusColor = getStatusColor(transaction.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Chi tiết giao dịch
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Transaction Summary Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-soft">
          <View className="items-center mb-6">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-3`}
              style={{ backgroundColor: `${statusColor}15` }}
            >
              <Ionicons
                name={isOutgoing ? "arrow-up" : "arrow-down"}
                size={32}
                color={statusColor}
              />
            </View>

            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {isOutgoing ? "-" : "+"} {formatVND(transaction.amount)}
            </Text>

            <View className="flex-row items-center">
              <View
                className={`w-3 h-3 rounded-full mr-2`}
                style={{ backgroundColor: statusColor }}
              />
              <Text className="text-gray-600 font-medium">
                {getStatusLabel(transaction.status)}
              </Text>
            </View>
          </View>

          {/* Transaction Info */}
          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Loại giao dịch</Text>
              <Text className="font-medium text-gray-800">
                {transaction.type === "TRANSFER"
                  ? "Chuyển khoản"
                  : transaction.type}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Từ</Text>
              <Text className="font-medium text-gray-800">
                {formatShopName(transaction.from)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Đến</Text>
              <Text className="font-medium text-gray-800">
                {formatShopName(transaction.to)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Thời gian</Text>
              <Text className="font-medium text-gray-800">
                {formatDistanceToNow(new Date(transaction.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </Text>
            </View>

            {transaction.note && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Ghi chú</Text>
                <Text className="font-medium text-gray-800">
                  {transaction.note}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Details */}
        {transaction.order && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-soft">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Chi tiết đơn hàng
            </Text>

            <View className="space-y-4">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Loại đơn hàng</Text>
                <Text className="font-medium text-gray-800">
                  {getOrderTypeLabel(transaction.order.type)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Trạng thái</Text>
                <Text className="font-medium text-gray-800">
                  {getStatusLabel(transaction.order.status)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Số tiền</Text>
                <Text className="font-medium text-gray-800">
                  {formatVND(transaction.order.amount)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Ngày hẹn</Text>
                <Text className="font-medium text-gray-800">
                  {transaction.order.dueDate
                    ? new Date(transaction.order.dueDate).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Không có"}
                </Text>
              </View>

              {transaction.order.returnDate && (
                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Ngày trả</Text>
                  <Text className="font-medium text-gray-800">
                    {new Date(transaction.order.returnDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start py-2">
                <Text className="text-gray-600">Địa chỉ</Text>
                <Text className="font-medium text-gray-800 text-right flex-1 ml-4">
                  {transaction.order.address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Wallet Info */}
        <View className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-6 shadow-soft">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin ví
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Số dư khả dụng</Text>
              <Text className="font-medium text-gray-800">
                {formatVND(transaction.wallet.availableBalance)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-600">Số dư bị khóa</Text>
              <Text className="font-medium text-gray-800">
                {formatVND(transaction.wallet.lockedBalance)}
              </Text>
            </View>

            {transaction.wallet.bin && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">BIN ngân hàng</Text>
                <Text className="font-medium text-gray-800">
                  {transaction.wallet.bin}
                </Text>
              </View>
            )}

            {transaction.wallet.bankNumber && (
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Số tài khoản</Text>
                <Text className="font-medium text-gray-800">
                  {transaction.wallet.bankNumber}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
