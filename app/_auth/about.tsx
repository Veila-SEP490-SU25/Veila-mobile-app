import { Ionicons } from "@expo/vector-icons";
import assets from "assets";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AboutVeilaScreen = () => {
  const router = useRouter();

  const features = [
    {
      icon: "shirt-outline",
      title: "Thời trang cao cấp",
      description: "Sản phẩm thời trang chất lượng cao với thiết kế độc đáo",
      color: "#E05C78",
    },
    {
      icon: "cut-outline",
      title: "Đặt may theo yêu cầu",
      description: "Dịch vụ may đo cá nhân hóa theo kích thước và sở thích",
      color: "#10B981",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Bảo mật thông tin",
      description: "Đảm bảo an toàn thông tin cá nhân và thanh toán",
      color: "#3B82F6",
    },
    {
      icon: "car-outline",
      title: "Giao hàng toàn quốc",
      description: "Dịch vụ giao hàng nhanh chóng và đáng tin cậy",
      color: "#F59E0B",
    },
  ];

  const stats = [
    { number: "10K+", label: "Khách hàng" },
    { number: "50K+", label: "Sản phẩm" },
    { number: "98%", label: "Hài lòng" },
    { number: "24/7", label: "Hỗ trợ" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-gradient-to-b from-pink-50 to-white px-6 pt-4 pb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-6 z-10"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="items-center pt-8">
            <Image
              source={assets.Images.logo}
              resizeMode="contain"
              className="w-24 h-24 mb-4"
            />
            <Text className="text-2xl font-bold text-maroon-500 font-playfair text-center mb-2">
              Về Veila
            </Text>
            <Text className="text-center text-sm text-gray-600 font-sans leading-5 max-w-xs">
              Nền tảng thời trang cao cấp với dịch vụ đặt may theo yêu cầu
            </Text>
          </View>
        </View>

        <View className="px-6 py-6">
          <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-6">
            <Text className="text-sm text-blue-800 leading-6 text-center">
              Veila là thương hiệu thời trang Việt Nam, chuyên cung cấp các sản
              phẩm thời trang cao cấp và dịch vụ may đo cá nhân hóa. Chúng tôi
              cam kết mang đến những trải nghiệm mua sắm tuyệt vời nhất cho
              khách hàng.
            </Text>
          </View>

          {/* Statistics */}
          <View className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
              Thống kê nổi bật
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {stats.map((stat, index) => (
                <View key={index} className="w-1/2 items-center mb-4">
                  <Text className="text-2xl font-bold text-maroon-500 mb-1">
                    {stat.number}
                  </Text>
                  <Text className="text-sm text-gray-600 text-center">
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
              Tính năng nổi bật
            </Text>
            <View className="space-y-3">
              {features.map((feature, index) => (
                <View
                  key={index}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <View className="flex-row items-start">
                    <View
                      className="rounded-full p-2 mr-3"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Ionicons
                        name={feature.icon as any}
                        size={20}
                        color={feature.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800 mb-1">
                        {feature.title}
                      </Text>
                      <Text className="text-xs text-gray-600 leading-4">
                        {feature.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-6">
            <Text className="text-sm font-semibold text-green-800 mb-3 text-center">
              Thông tin liên hệ
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-center justify-center">
                <Ionicons name="mail-outline" size={16} color="#10B981" />
                <Text className="text-sm text-green-700 ml-2">
                  support@veila.com
                </Text>
              </View>
              <View className="flex-row items-center justify-center">
                <Ionicons name="call-outline" size={16} color="#10B981" />
                <Text className="text-sm text-green-700 ml-2">1900-xxxx</Text>
              </View>
              <View className="flex-row items-center justify-center">
                <Ionicons name="location-outline" size={16} color="#10B981" />
                <Text className="text-sm text-green-700 ml-2 text-center">
                  TP.HCM, Việt Nam
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-xs text-gray-500 text-center">
              Phiên bản 1.0.0
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-1">
              © 2024 Veila. Tất cả quyền được bảo lưu.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutVeilaScreen;
