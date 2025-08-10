import React from "react";
import { Alert, Image, Text, TouchableOpacity } from "react-native";
import { default as assets } from "../../../assets";
import { useAuth } from "../../../providers/auth.provider";
import {
  GOOGLE_AUTH_CONFIG,
  isUsingMock,
} from "../../../utils/google-auth.config";

export const GoogleLoginButton = () => {
  const { googleLogin } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      if (isUsingMock()) {
        console.log(
          "Đang đăng nhập Google với mock data:",
          GOOGLE_AUTH_CONFIG.MOCK_DATA
        );
        await googleLogin(GOOGLE_AUTH_CONFIG.MOCK_DATA);
      } else {
        Alert.alert("Thông báo", "Google OAuth thật sẽ được implement sau");
      }
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Lỗi", "Không thể đăng nhập với Google");
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center w-full py-3 rounded-2xl bg-white border border-primary-500"
      onPress={handleGoogleLogin}
    >
      <Image
        source={assets.Images.google}
        className="w-5 h-5 mr-2"
        resizeMode="contain"
      />
      <Text className="text-primary-500 font-medium">Đăng nhập với Google</Text>
    </TouchableOpacity>
  );
};
