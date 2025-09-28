import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { walletApi } from "../../services/apis/wallet.api";

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "processing" | "error">(
    "processing"
  );

  useEffect(() => {
    handlePaymentSuccess();
  }, []);

  const handlePaymentSuccess = async () => {
    const { transactionId } = params;

    if (!transactionId) {
      setStatus("error");
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không tìm thấy thông tin giao dịch",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      // Gọi API webhook để cập nhật trạng thái thanh toán
      const response = await walletApi.paymentWebhook({
        transactionId: transactionId as string,
        status: "COMPLETED", // PayOS đã chuyển về success nên status = COMPLETED
      });

      if (response.statusCode === 200) {
        setStatus("success");
        Toast.show({
          type: "success",
          text1: "Thanh toán thành công!",
          text2: "Tiền đã được nạp vào ví của bạn",
          visibilityTime: 5000,
        });
      } else {
        setStatus("error");
        Toast.show({
          type: "error",
          text1: "Lỗi cập nhật",
          text2: "Không thể cập nhật trạng thái thanh toán",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Payment webhook error:", error);
      setStatus("error");
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi khi xử lý thanh toán",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWallet = () => {
    router.replace("/account/wallet");
  };

  const handleBackToHome = () => {
    router.replace("/_tab/home");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">
            Đang xử lý thanh toán...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {status === "success" ? (
          <>
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark" size={48} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Thanh toán thành công!
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Tiền đã được nạp vào ví của bạn. Bạn có thể kiểm tra số dư trong
              phần quản lý ví.
            </Text>
          </>
        ) : status === "error" ? (
          <>
            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="close" size={48} color="#EF4444" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Có lỗi xảy ra
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Không thể xử lý thanh toán. Vui lòng liên hệ hỗ trợ để được giúp
              đỡ.
            </Text>
          </>
        ) : (
          <>
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="time" size={48} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Đang xử lý
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Vui lòng chờ trong khi chúng tôi xử lý thanh toán của bạn.
            </Text>
          </>
        )}

        <View className="w-full space-y-4">
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-4 px-6 items-center"
            onPress={handleBackToWallet}
          >
            <Text className="text-white font-semibold text-lg">
              Xem ví của tôi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-200 rounded-xl py-4 px-6 items-center"
            onPress={handleBackToHome}
          >
            <Text className="text-gray-700 font-semibold text-lg">
              Về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
