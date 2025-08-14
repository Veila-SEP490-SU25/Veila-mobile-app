import { Ionicons } from "@expo/vector-icons";
import assets from "assets";
import { LoadingItem } from "components/loadingItem";
import { useRouter } from "expo-router";
import React, { Suspense } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneVerificationForm from "../../components/auth/verify/PhoneVerificationForm";
import { useAuth } from "../../providers/auth.provider";

const Separator = () => <View className="w-full h-px bg-gray-200 my-6" />;

const PhoneVerificationScreen = () => {
  const { user } = useAuth();
  const router = useRouter();

  const getScreenTitle = () => {
    if (!user?.phone) {
      return "Xác minh số điện thoại";
    }
    return "Quản lý số điện thoại";
  };

  const getScreenDescription = () => {
    if (!user?.phone) {
      return "Để bảo mật tài khoản, chúng tôi cần xác minh số điện thoại của bạn. Số điện thoại sẽ được xác minh thông qua Firebase SMS.";
    }
    return "Bạn có thể thay đổi hoặc xác minh lại số điện thoại của mình. Khi thay đổi số điện thoại, số cũ sẽ bị mất xác thực.";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header Section */}
        <View className="px-6 ">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>

          <View className="items-center  ">
            <Image
              source={assets.Images.logo}
              resizeMode="contain"
              className="w-16 h-16"
            />

            <Text className="text-xl font-bold text-maroon-500 font-playfair text-center mb-2">
              {getScreenTitle()}
            </Text>

            <Text className="text-center text-xs text-gray-600 font-sans leading-5 max-w-xl">
              {getScreenDescription()}
            </Text>
          </View>
        </View>

        <Separator />

        {/* Main Content */}
        <View className="px-6 flex-1">
          <Suspense
            fallback={
              <View className="w-full space-y-3">
                <LoadingItem />
                <LoadingItem />
                <LoadingItem />
              </View>
            }
          >
            <PhoneVerificationForm />
          </Suspense>
        </View>

        {/* Security Features */}
        <View className="px-10 pb-6 gap-y-3">
          {/* Project Verification */}
          <View className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 shadow-sm">
            <View className="flex-row items-start">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="shield-checkmark" size={18} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-purple-800 mb-1">
                  Xác thực dự án Veila
                </Text>
                <Text className="text-xs text-purple-700 leading-5">
                  Dự án thương mại điện tử thời trang với công nghệ xác thực số
                  điện thoại tiên tiến
                </Text>
              </View>
            </View>
          </View>

          {/* Business Security */}
          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
            <View className="flex-row items-start">
              <View className="bg-green-100 rounded-full p-2 mr-3">
                <Ionicons name="lock-closed" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-green-800 mb-1">
                  Bảo mật nghiệp vụ
                </Text>
                <Text className="text-xs text-green-700 leading-5">
                  Xác thực số điện thoại để đảm bảo an toàn trong giao dịch mua
                  bán và thanh toán
                </Text>
              </View>
            </View>
          </View>

          {/* Process Info */}
          <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
            <View className="flex-row items-start">
              <View className="bg-blue-100 rounded-full p-2 mr-3">
                <Ionicons name="information-circle" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-blue-800 mb-1">
                  Quy trình xác thực
                </Text>
                <Text className="text-xs text-blue-700 leading-5">
                  Nhập số điện thoại → Nhận mã SMS → Xác minh → Lưu vào hệ thống
                </Text>
              </View>
            </View>
          </View>

          {/* Change Phone Warning */}
          {user?.phone && (
            <View className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 shadow-sm">
              <View className="flex-row items-start">
                <View className="bg-orange-100 rounded-full p-2 mr-3">
                  <Ionicons name="alert-circle" size={18} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-orange-800 mb-1">
                    Lưu ý quan trọng
                  </Text>
                  <Text className="text-xs text-orange-700 leading-5">
                    Khi thay đổi số điện thoại, số cũ sẽ bị mất xác thực và bạn
                    cần xác thực lại số mới
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhoneVerificationScreen;
