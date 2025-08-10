import React, { useState } from "react";

import { default as assets } from "assets";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GoogleOAuthButton } from "../../components/auth/login/GoogleOAuthButton";
import { OtpLoginForm } from "../../components/auth/login/otp-login-form";
import { PasswordLoginForm } from "../../components/auth/login/password-login-form";

export default function LoginScreen() {
  const [tab, setTab] = useState<"password" | "otp">("password");

  return (
    <View className="flex-1 bg-background px-6 pt-32">
      <View className="flex-1 justify-between">
        <View>
          <Image
            source={assets.Images.logo}
            resizeMode="contain"
            className="w-40 h-24 mb-6 self-center"
          />

          <Text className="text-2xl font-bold text-gray-700 mb-1 text-center">
            Chào mừng bạn
          </Text>
          <Text className="text-sm text-gray-400 mb-6 text-center">
            Vui lòng đăng nhập để tiếp tục
          </Text>

          <View className="flex-row px-5 w-full gap-2 mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full border ${
                tab === "password"
                  ? "bg-primary-500 border-primary-500"
                  : "border-gray-300 bg-white"
              }`}
              onPress={() => setTab("password")}
            >
              <Text
                className={`text-center font-medium ${
                  tab === "password" ? "text-white" : "text-gray-700"
                }`}
              >
                Mật khẩu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 rounded-full border ${
                tab === "otp"
                  ? "bg-primary-500 border-primary-500"
                  : "border-gray-300 bg-white"
              }`}
              onPress={() => setTab("otp")}
            >
              <Text
                className={`text-center font-medium ${
                  tab === "otp" ? "text-white" : "text-gray-700"
                }`}
              >
                OTP
              </Text>
            </TouchableOpacity>
          </View>

          <View className="w-full">
            {tab === "password" ? <PasswordLoginForm /> : <OtpLoginForm />}
          </View>
        </View>

        <View className="mt-10 pb-44 px-5">
          <Text className="text-center text-sm text-gray-500 mb-4">
            Bạn chưa có tài khoản?{" "}
            <Text
              className="text-primary-500 font-semibold "
              onPress={() => router.push("/_auth/register")}
            >
              Đăng ký
            </Text>
          </Text>

          <View className="flex-row items-center w-full mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-2 text-sm text-gray-400">Hoặc</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <GoogleOAuthButton />
        </View>
      </View>
    </View>
  );
}
