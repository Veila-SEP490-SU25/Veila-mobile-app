import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentSuccessScreen() {
  useEffect(() => {

    const timer = setTimeout(() => {
      router.replace("/account/wallet");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToWallet = () => {
    try {
      router.replace("/account/wallet");
    } catch (error) {
      console.error("Navigation error:", error);

      router.push("/account/wallet");
    }
  };

  const handleGoToTransactions = () => {
    try {
      router.push("/account/transactions");
    } catch (error) {
      console.error("Navigation error:", error);

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
            Thanh toán thành công
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={72} color="#10B981" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center">
            Thanh toán thành công!
          </Text>

          <Text className="text-gray-600 mt-3 text-center text-base leading-6">
            Giao dịch của bạn đã được xử lý thành công. Số tiền sẽ được cập nhật
            vào ví trong vài phút.
          </Text>

          <View className="mt-8 w-full space-y-3">
            <TouchableOpacity
              className="bg-green-600 rounded-xl py-4 px-6 items-center"
              onPress={handleGoToWallet}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                Về trang ví
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-100 rounded-xl py-4 px-6 items-center"
              onPress={handleGoToTransactions}
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-medium">
                Xem lịch sử giao dịch
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-400 text-sm text-center mt-6">
            Tự động chuyển về ví sau 5 giây
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
