import Images from "assets";
import { RegisterForm } from "components/auth/register/register-form";
import { router } from "expo-router";

import { Image, Text, TouchableOpacity, View } from "react-native";

const RegisterScreen = () => {
  return (
    <View className="flex-1 bg-background px-6 pt-28">
      <View className="flex-1 justify-between">
        <View>
          <Image
            source={Images.logo}
            resizeMode="contain"
            className="w-40 h-24 mb-6 self-center"
          />
          <Text className="text-2xl font-bold text-gray-700 mb-1 text-center">
            Đăng ký
          </Text>

          <Text className="text-sm text-gray-400 mb-6 text-center">
            Đăng ký tài khoản mới
          </Text>

          <View className="w-full h-px bg-gray-200" />
          <View className="w-full">
            <RegisterForm />
          </View>
          <View className="mt-10 pb-44 px-5">
            <Text className="text-center text-sm text-gray-500 mb-4">
              Bạn đã có tài khoản?{" "}
              <Text
                className="text-primary-500 font-semibold "
                onPress={() => router.push("/_auth/login")}
              >
                Đăng nhập
              </Text>
            </Text>

            <View className="flex-row items-center w-full mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-2 text-sm text-gray-400">Hoặc</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <TouchableOpacity className="flex-row items-center justify-center w-full py-3 rounded-2xl bg-white border border-primary-500">
              <Image
                source={Images.google}
                className="w-5 h-5 mr-2"
                resizeMode="contain"
              />
              <Text className="text-primary-500 font-medium">
                Đăng nhập với Google
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
