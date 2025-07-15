import React, { useCallback, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../providers/auth.provider";

export const OtpLoginForm = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");

  const handleRequestOtp = useCallback(async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email",
      });
      return;
    }

    try {
      await login({ email, password: "" });
    } catch {}
  }, [email, login]);

  return (
    <View className="w-full px-6 mt-8">
      <Text className="text-lg pl-5 font-semibold text-gray-700 mb-5">
        Nhập email để nhận mã OTP
      </Text>

      <View className="gap-5">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800 focus:border-primary-500"
          placeholderTextColor="#D1D5DB"
        />

        <TouchableOpacity
          onPress={handleRequestOtp}
          disabled={isLoading}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
            isLoading
              ? "bg-primary-100 opacity-50"
              : "bg-primary-500 active:bg-primary-600"
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              isLoading ? "text-primary-500" : "text-white"
            }`}
          >
            {isLoading ? "Đang gửi mã OTP..." : "Nhận mã OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
