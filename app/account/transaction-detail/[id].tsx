import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  transactionApi,
  TransactionItem,
} from "../../../services/apis/transaction.api";

const statusColors: { [key: string]: string } = {
  completed: "#10B981",
  pending: "#F59E0B",
  failed: "#EF4444",
};

const statusLabels: { [key: string]: string } = {
  completed: "Hoàn thành",
  pending: "Đang xử lý",
  failed: "Thất bại",
};

const typeLabels: { [key: string]: string } = {
  transfer: "Chuyển khoản",
  deposit: "Nạp tiền",
  withdraw: "Rút tiền",
};

const orderTypeLabels: { [key: string]: string } = {
  SELL: "Mua váy",
  RENT: "Thuê váy",
  CUSTOM: "Đặt may",
};

const orderStatusLabels: { [key: string]: string } = {
  PENDING: "Chờ xử lý",
  IN_PROCESS: "Đang xử lý",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<TransactionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTransactionDetail();
    }
  }, [id]);

  const loadTransactionDetail = async () => {
    try {
      setLoading(true);
      const response = await transactionApi.getTransactionDetail(id!);
      if (response.statusCode === 200) {
        setTransaction(response.items);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi tải chi tiết",
        text2: error?.message || "Không thể tải thông tin giao dịch",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'lúc' HH:mm", {
      locale: vi,
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-gray-600 mt-2">
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
            Không tìm thấy giao dịch
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-6 mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = statusColors[transaction.status] || "#6B7280";
  const isOutgoing = transaction.fromTypeBalance === "available";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
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
        {/* Transaction Status Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm">
          <View className="items-center mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${statusColor}15` }}
            >
              <Ionicons
                name={isOutgoing ? "arrow-up" : "arrow-down"}
                size={32}
                color={statusColor}
              />
            </View>
            <Text
              className={`text-2xl font-bold ${isOutgoing ? "text-red-600" : "text-green-600"}`}
            >
              {isOutgoing ? "-" : "+"} {formatCurrency(transaction.amount)}
            </Text>
            <View className="flex-row items-center mt-2">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: statusColor }}
              />
              <Text
                className="text-sm font-medium"
                style={{ color: statusColor }}
              >
                {statusLabels[transaction.status] || transaction.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Info */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin giao dịch
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Mã giao dịch</Text>
              <Text className="font-medium text-gray-900">
                {transaction.id.slice(-12)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Loại giao dịch</Text>
              <Text className="font-medium text-gray-900">
                {typeLabels[transaction.type] || transaction.type}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Thời gian tạo</Text>
              <Text className="font-medium text-gray-900">
                {formatDateTime(transaction.createdAt)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Từ</Text>
              <Text className="font-medium text-gray-900">
                {transaction.from}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Đến</Text>
              <Text className="font-medium text-gray-900">
                {transaction.to}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Loại số dư (từ)</Text>
              <Text className="font-medium text-gray-900 capitalize">
                {transaction.fromTypeBalance}
              </Text>
            </View>

            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Loại số dư (đến)</Text>
              <Text className="font-medium text-gray-900 capitalize">
                {transaction.toTypeBalance}
              </Text>
            </View>

            {transaction.note && (
              <View className="flex-row justify-between py-2 border-t border-gray-100">
                <Text className="text-gray-600">Ghi chú</Text>
                <Text className="font-medium text-gray-900 flex-1 text-right">
                  {transaction.note}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Info */}
        {transaction.order && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin đơn hàng
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Mã đơn hàng</Text>
                <Text className="font-medium text-gray-900">
                  {transaction.order.id.slice(-12)}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Loại đơn hàng</Text>
                <Text className="font-medium text-gray-900">
                  {orderTypeLabels[transaction.order.type] ||
                    transaction.order.type}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Trạng thái đơn hàng</Text>
                <Text className="font-medium text-gray-900">
                  {orderStatusLabels[transaction.order.status] ||
                    transaction.order.status}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Số điện thoại</Text>
                <Text className="font-medium text-gray-900">
                  {transaction.order.phone}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Email</Text>
                <Text className="font-medium text-gray-900">
                  {transaction.order.email}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Địa chỉ giao hàng</Text>
                <Text className="font-medium text-gray-900 flex-1 text-right">
                  {transaction.order.address}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Giá trị đơn hàng</Text>
                <Text className="font-medium text-gray-900">
                  {formatCurrency(transaction.order.amount)}
                </Text>
              </View>

              {transaction.order.dueDate && (
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Ngày dự kiến</Text>
                  <Text className="font-medium text-gray-900">
                    {format(new Date(transaction.order.dueDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </Text>
                </View>
              )}

              {transaction.order.returnDate && (
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-600">Ngày trả</Text>
                  <Text className="font-medium text-gray-900">
                    {format(
                      new Date(transaction.order.returnDate),
                      "dd/MM/yyyy",
                      { locale: vi }
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Wallet Info */}
        <View className="bg-white mx-4 mt-4 mb-6 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin ví
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Mã ví</Text>
              <Text className="font-medium text-gray-900">
                {transaction.wallet.id.slice(-12)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Số dư khả dụng</Text>
              <Text className="font-medium text-green-600">
                {formatCurrency(transaction.wallet.availableBalance)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Số dư bị khóa</Text>
              <Text className="font-medium text-orange-600">
                {formatCurrency(transaction.wallet.lockedBalance)}
              </Text>
            </View>

            {transaction.wallet.bin && (
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">BIN</Text>
                <Text className="font-medium text-gray-900">
                  {transaction.wallet.bin}
                </Text>
              </View>
            )}

            {transaction.wallet.bankNumber && (
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Số tài khoản</Text>
                <Text className="font-medium text-gray-900">
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
