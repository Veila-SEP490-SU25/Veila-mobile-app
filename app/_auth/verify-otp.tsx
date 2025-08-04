import assets from "assets";
import { LoadingItem } from "components/loadingItem";
import React, { Suspense } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import VerifyOtpForm from "../../components/auth/verify/VerifyOtpForm";

const Separator = () => <View className="w-full h-px bg-gray-300 my-4" />;

const VerifyOtpScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      className="bg-white"
    >
      <View className="flex-1 py-32 px-4 items-center gap-4">
        <Image
          source={assets.Images.logo}
          resizeMode="contain"
          className="w-1/2 h-20"
        />

        <Text className="text-3xl font-bold text-maroon-500 font-playfair">
          Xác thực email
        </Text>

        <Text className="text-center text-sm text-crimson-900 font-sans">
          Chúng tôi đã gửi một mã OTP đến email của bạn.{"\n"}
          Vui lòng nhập mã OTP để xác thực tài khoản.
        </Text>

        <Separator />

        <Suspense
          fallback={
            <View className="w-full flex flex-col gap-2">
              <LoadingItem />
              <LoadingItem />
              <LoadingItem />
            </View>
          }
        >
          <VerifyOtpForm />
        </Suspense>
      </View>
    </ScrollView>
  );
};

export default VerifyOtpScreen;
