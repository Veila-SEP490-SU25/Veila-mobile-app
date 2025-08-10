import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Alert, Image, Text, TouchableOpacity } from "react-native";
import { default as assets } from "../../../assets";
import { useAuth } from "../../../providers/auth.provider";
import { getGoogleClientId } from "../../../utils/google-auth.config";

WebBrowser.maybeCompleteAuthSession();

export const GoogleOAuthButton = () => {
  const { googleLogin } = useAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: getGoogleClientId("web"),
    iosClientId: getGoogleClientId("ios"),
    androidClientId: getGoogleClientId("android"),
  });

  const handleGoogleSignIn = React.useCallback(
    async (idToken: string) => {
      try {
        // Lấy thông tin user từ Google
        const response = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        const userInfo = await response.json();

        // Gọi API backend với thông tin user
        await googleLogin({
          email: userInfo.email,
          fullname: userInfo.name,
        });
      } catch (error) {
        console.error("Google sign-in error:", error);
        Alert.alert("Lỗi", "Không thể đăng nhập với Google");
      }
    },
    [googleLogin]
  );

  React.useEffect(() => {
    if (response?.type === "success" && response.authentication?.idToken) {
      handleGoogleSignIn(response.authentication.idToken);
    }
  }, [response, handleGoogleSignIn]);

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Lỗi", "Không thể đăng nhập với Google");
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center w-full py-3 rounded-2xl bg-white border border-primary-500"
      onPress={handleGoogleLogin}
      disabled={!request}
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
