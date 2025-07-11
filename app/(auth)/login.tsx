import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [tab, setTab] = useState<"password" | "otp">("password");

  return (
    <View className="flex-1 items-center justify-start px-6 py-40 bg-white">
      <Image
        source={require("../../assets/logo.png")}
        resizeMode="contain"
        className="w-1/2 h-32 mb-4"
      />

      <Text className="text-3xl font-bold text-maroon-600 mb-2">Đăng nhập</Text>
      <Text className="text-sm text-center text-maroon-500 mb-4">
        Đăng nhập vào tài khoản của bạn để tiếp tục
      </Text>

      <View className="flex-row w-full gap-2 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-full border ${
            tab === "password"
              ? "bg-maroon-500 border-maroon-500"
              : "border-gray-300"
          }`}
          onPress={() => setTab("password")}
        >
          <Text
            className={`text-center ${
              tab === "password" ? "text-white" : "text-gray-700"
            }`}
          >
            Dùng mật khẩu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 rounded-full border ${
            tab === "otp"
              ? "bg-maroon-500 border-maroon-500"
              : "border-gray-300"
          }`}
          onPress={() => setTab("otp")}
        >
          <Text
            className={`text-center ${
              tab === "otp" ? "text-white" : "text-gray-700"
            }`}
          >
            Dùng mã OTP
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-full mb-6">
        {/* {tab === "password" ? <PasswordLoginForm /> : <OtpLoginForm />} */}
      </View>

      <View className="flex-row items-center w-full mb-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-2 text-sm text-gray-500">Hoặc</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity className="flex-row items-center justify-center w-full py-3 rounded-full border border-maroon-500 bg-white">
        <Text className="text-maroon-500 font-semibold mr-2">
          Đăng nhập với Google
        </Text>
        <Image
          source={require("../../assets/google-icon.svg")}
          className="w-5 h-5"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
