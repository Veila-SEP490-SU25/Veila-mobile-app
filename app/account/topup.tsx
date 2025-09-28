import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/auth.provider";
import { walletApi } from "../../services/apis/wallet.api";
import { showMessage } from "../../utils/message.util";

export default function TopupScreen() {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("Nạp tiền vào ví");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const formatAmountInput = (value: string) => value.replace(/[^0-9]/g, "");

  const handleTopup = async () => {
    if (!user?.isIdentified) {
      showMessage("ERM008", "Cần xác thực số điện thoại để nạp tiền");
      return;
    }

    const num = parseInt(amount || "0", 10);
    if (!num || num <= 0) {
      showMessage("ERM004", "Số tiền nạp phải lớn hơn 0");
      return;
    }

    try {
      setIsLoading(true);
      const res = await walletApi.deposit({
        amount: num,
        note: note ?? "",
      });

      if (res.statusCode === 200 && res.item?.checkoutUrl) {
        showMessage("INF001", "Chuyển đến cổng thanh toán");
        router.push({
          pathname: "/payment/checkout",
          params: { url: res.item.checkoutUrl },
        } as any);
      } else {
        showMessage("ERM005", "Không thể tạo liên kết thanh toán");
      }
    } catch {
      showMessage("ERM005", "Lỗi nạp tiền. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-100 bg-white">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-800">
                Nạp tiền vào ví
              </Text>
              <View className="w-10" />
            </View>
          </View>

          {/* Phone Verification Notice */}
          {!user?.isIdentified && (
            <View className="mx-6 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#F97316"
                  className="mt-0.5"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-orange-800 font-medium text-sm">
                    Cần xác thực số điện thoại
                  </Text>
                  <Text className="text-orange-700 text-xs mt-1">
                    Bạn cần xác thực số điện thoại trước khi có thể nạp tiền vào
                    ví.
                  </Text>
                  <TouchableOpacity
                    className="mt-2 bg-orange-600 rounded-lg px-3 py-2 self-start"
                    onPress={() => router.push("/_auth/phone-verification")}
                  >
                    <Text className="text-white text-xs font-medium">
                      Xác thực ngay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Form */}
          <View className="px-6 pt-4">
            <Text className="text-sm text-gray-700 font-medium mb-2">
              Số tiền (VND)
            </Text>
            <TextInput
              value={amount}
              onChangeText={(t) => setAmount(formatAmountInput(t))}
              placeholder="VD: 150000"
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl px-3 py-3 text-gray-900 bg-white text-sm shadow-sm"
              editable={!isLoading}
            />

            <Text className="text-sm text-gray-700 font-medium mt-4 mb-2">
              Ghi chú
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ghi chú giao dịch"
              className="border border-gray-300 rounded-xl px-3 py-3 text-gray-900 bg-white text-sm shadow-sm"
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleTopup}
              disabled={isLoading || !amount || !user?.isIdentified}
              className="rounded-xl py-3 px-4 mt-6"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                backgroundColor:
                  isLoading || !amount || !user?.isIdentified
                    ? "#D1D5DB"
                    : "#E05C78",
                borderWidth: 1,
                borderColor:
                  isLoading || !amount || !user?.isIdentified
                    ? "#D1D5DB"
                    : "#C04060",
              }}
            >
              <Text className="text-white font-semibold text-center text-sm">
                {!user?.isIdentified ? "Cần xác thực SĐT" : "Tạo thanh toán"}
              </Text>
            </TouchableOpacity>

            <View className="mt-3">
              <Text className="text-xs text-gray-500">
                Bạn sẽ được chuyển đến cổng thanh toán PayOS. Sau khi thanh toán
                thành công, hệ thống sẽ tự động chuyển về ứng dụng.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
