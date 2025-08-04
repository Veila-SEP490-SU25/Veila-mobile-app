import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useRegisterMutation } from "../../../services/apis";

export const RegisterForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");

  const [registerMutation, { isLoading }] = useRegisterMutation();

  const handleRegister = useCallback(async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Vui lòng nhập đầy đủ thông tin",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu không khớp",
      });
      return;
    }

    try {
      const { item, message, statusCode } = await registerMutation({
        email,
        password,
        firstName,
        lastName,
        middleName,
      }).unwrap();

      if (statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Đăng ký thành công",
          text2: "Vui lòng xác minh email",
        });
        router.push({
          pathname: "/_auth/verify-otp",
          params: { userId: item, email },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Đăng ký thất bại",
          text2: message || "",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra",
        text2: "Vui lòng thử lại sau",
      });
    }
  }, [
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    middleName,
    registerMutation,
    router,
  ]);

  return (
    <View className="w-full px-6 mt-6">
      <Text className="text-lg pl-5 font-semibold text-gray-700 mb-5">
        Đăng ký tài khoản
      </Text>

      <View className="gap-3">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800"
          placeholderTextColor="#9CA3AF"
        />

        <View className="flex-row gap-2">
          <TextInput
            placeholder="Họ"
            value={firstName}
            onChangeText={setFirstName}
            className="flex-1 h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            placeholder="Tên"
            value={lastName}
            onChangeText={setLastName}
            className="flex-1 h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TextInput
          placeholder="Tên đệm"
          value={middleName}
          onChangeText={setMiddleName}
          className="w-full h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800"
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          className="w-full h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800"
          placeholderTextColor="#9CA3AF"
          textContentType="password"
          autoComplete="off"
          importantForAutofill="no"
          autoCorrect={false}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          className="w-full h-14 px-5 bg-gray-50 border border-primary-100 rounded-2xl text-base text-gray-800"
          placeholderTextColor="#9CA3AF"
          textContentType="password"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
            isLoading
              ? "bg-primary-100"
              : "bg-primary-500 active:bg-primary-600"
          }`}
        >
          <Text
            className={`font-semibold text-base ${
              isLoading ? "text-primary-500" : "text-white"
            }`}
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
