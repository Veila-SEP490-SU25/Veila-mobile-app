import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useRequestOtpMutation } from "../../../services/apis";

export const OtpLoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [requestOtp, { isLoading }] = useRequestOtpMutation();

  const handleRequestOtp = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập email",
      });
      return;
    }

    try {
      const res = await requestOtp({ email: trimmedEmail }).unwrap();

      if (res.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Đã gửi mã OTP",
          text2: "Vui lòng kiểm tra email của bạn.",
        });
        router.push({
          pathname: "/_auth/verify-otp",
          params: {
            userId: res.item,
            email,
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Không thể gửi mã OTP",
          text2: res.message || "",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại.",
      });
    }
  }, [email, requestOtp, router]);

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
