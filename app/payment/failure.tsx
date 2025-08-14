import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentFailureScreen() {
  const handleGoToWallet = () => {
    try {
      router.replace("/account/wallet");
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      router.push("/account/wallet");
    }
  };

  const handleRetryPayment = () => {
    try {
      router.back();
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      router.push("/account/topup");
    }
  };

  const handleGoToTransactions = () => {
    try {
      router.push("/account/transactions");
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      router.push("/account/transactions");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="w-10" />
          <Text className="text-lg font-semibold text-gray-800">
            Thanh toán thất bại
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center">
          <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="close-circle" size={72} color="#EF4444" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center">
            Thanh toán thất bại
          </Text>

          <Text className="text-gray-600 mt-3 text-center text-base leading-6">
            Giao dịch đã bị hủy hoặc gặp lỗi. Vui lòng kiểm tra lại thông tin và
            thử lại.
          </Text>

          <View className="mt-8 w-full space-y-3">
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-4 px-6 items-center"
              onPress={handleRetryPayment}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                Thử lại thanh toán
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 rounded-xl py-4 px-6 items-center"
              onPress={handleGoToWallet}
              activeOpacity={0.8}
            >
              <Text className="text-gray-800 font-medium">Về trang ví</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-blue-100 rounded-xl py-4 px-6 items-center"
              onPress={handleGoToTransactions}
              activeOpacity={0.8}
            >
              <Text className="text-blue-700 font-medium">
                Xem lịch sử giao dịch
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#F59E0B"
                className="mt-0.5"
              />
              <View className="ml-2 flex-1">
                <Text className="text-yellow-800 font-medium text-sm">
                  Lưu ý
                </Text>
                <Text className="text-yellow-700 text-xs mt-1">
                  Nếu bạn đã thanh toán nhưng gặp lỗi, vui lòng liên hệ hỗ trợ
                  khách hàng để được hỗ trợ.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
