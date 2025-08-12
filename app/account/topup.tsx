import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TOPUP_AMOUNTS = [
  { amount: 50000, label: "50.000đ" },
  { amount: 100000, label: "100.000đ" },
  { amount: 200000, label: "200.000đ" },
  { amount: 500000, label: "500.000đ" },
  { amount: 1000000, label: "1.000.000đ" },
  { amount: 2000000, label: "2.000.000đ" },
];

export default function TopUpScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const handleTopUp = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng chọn hoặc nhập số tiền hợp lệ");
      return;
    }
    if (!selectedMethod) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    Alert.alert(
      "Xác nhận nạp tiền",
      `Bạn có chắc chắn muốn nạp ${amount.toLocaleString("vi-VN")}đ vào ví?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: () => {
            console.log("Top up:", amount, "Method:", selectedMethod);
            Alert.alert("Thành công", "Đã gửi yêu cầu nạp tiền. Vui lòng chờ xử lý.");
            router.back();
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
          <Text className="text-lg font-semibold text-gray-800">Nạp tiền</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Amount Selection */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Chọn số tiền</Text>
          
          {/* Quick Amount Selection */}
          <View className="bg-white rounded-2xl p-4 shadow-soft mb-6">
            <View className="flex-row flex-wrap justify-between">
              {TOPUP_AMOUNTS.map((item) => (
                <TouchableOpacity
                  key={item.amount}
                  className={`w-[48%] py-4 px-3 rounded-xl mb-3 border-2 ${
                    selectedAmount === item.amount
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => {
                    setSelectedAmount(item.amount);
                    setCustomAmount("");
                  }}
                >
                  <Text
                    className={`text-center font-semibold ${
                      selectedAmount === item.amount
                        ? "text-primary-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View className="bg-white rounded-2xl p-4 shadow-soft mb-6">
            <Text className="text-base font-medium text-gray-700 mb-3">Hoặc nhập số tiền khác</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3">
              <Text className="text-lg text-gray-800 mr-2">₫</Text>
              <TextInput
                className="flex-1 text-lg text-gray-800"
                placeholder="Nhập số tiền"
                placeholderTextColor="#9CA3AF"
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text.replace(/[^0-9]/g, ""));
                  setSelectedAmount(null);
                }}
                keyboardType="numeric"
              />
            </View>
            {customAmount && (
              <Text className="text-sm text-gray-500 mt-2">
                Số tiền: {formatCurrency(parseFloat(customAmount) || 0)}
              </Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Phương thức thanh toán</Text>
          
          <View className="bg-white rounded-2xl shadow-soft">
            <TouchableOpacity
              className={`flex-row items-center p-4 border-b border-gray-100 ${
                selectedMethod === "momo" ? "bg-primary-50" : ""
              }`}
              onPress={() => setSelectedMethod("momo")}
            >
              <View className="w-12 h-12 bg-pink-500 rounded-xl items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">M</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Ví MoMo</Text>
                <Text className="text-sm text-gray-500">Thanh toán qua ví MoMo</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 ${
                selectedMethod === "momo" 
                  ? "border-primary-500 bg-primary-500" 
                  : "border-gray-300"
              }`}>
                {selectedMethod === "momo" && (
                  <View className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-4 border-b border-gray-100 ${
                selectedMethod === "zalo" ? "bg-primary-50" : ""
              }`}
              onPress={() => setSelectedMethod("zalo")}
            >
              <View className="w-12 h-12 bg-blue-500 rounded-xl items-center justify-center mr-4">
                <Text className="text-white font-bold text-lg">Z</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Ví ZaloPay</Text>
                <Text className="text-sm text-gray-500">Thanh toán qua ví ZaloPay</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 ${
                selectedMethod === "zalo" 
                  ? "border-primary-500 bg-primary-500" 
                  : "border-gray-300"
              }`}>
                {selectedMethod === "zalo" && (
                  <View className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-4 ${
                selectedMethod === "bank" ? "bg-primary-50" : ""
              }`}
              onPress={() => setSelectedMethod("bank")}
            >
              <View className="w-12 h-12 bg-green-500 rounded-xl items-center justify-center mr-4">
                <Ionicons name="card-outline" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Chuyển khoản ngân hàng</Text>
                <Text className="text-sm text-gray-500">Chuyển khoản qua tài khoản ngân hàng</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 ${
                selectedMethod === "bank" 
                  ? "border-primary-500 bg-primary-500" 
                  : "border-gray-300"
              }`}>
                {selectedMethod === "bank" && (
                  <View className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View className="mx-4 mt-6 mb-8">
          <View className="bg-white rounded-2xl p-4 shadow-soft">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Tóm tắt</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Số tiền nạp:</Text>
                <Text className="font-semibold text-gray-800">
                  {selectedAmount 
                    ? formatCurrency(selectedAmount)
                    : customAmount 
                    ? formatCurrency(parseFloat(customAmount) || 0)
                    : "0đ"
                  }
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Phí giao dịch:</Text>
                <Text className="font-semibold text-gray-800">0đ</Text>
              </View>
              <View className="border-t border-gray-100 pt-2">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-semibold text-gray-800">Tổng cộng:</Text>
                  <Text className="text-lg font-bold text-primary-600">
                    {selectedAmount 
                      ? formatCurrency(selectedAmount)
                      : customAmount 
                      ? formatCurrency(parseFloat(customAmount) || 0)
                      : "0đ"
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="bg-white px-6 py-4 border-t border-gray-100">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl ${
            (selectedAmount || customAmount) && selectedMethod
              ? "bg-primary-500"
              : "bg-gray-300"
          }`}
          onPress={handleTopUp}
          disabled={!((selectedAmount || customAmount) && selectedMethod)}
        >
          <Text className={`text-center font-semibold text-lg ${
            (selectedAmount || customAmount) && selectedMethod
              ? "text-white"
              : "text-gray-500"
          }`}>
            Nạp tiền
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 