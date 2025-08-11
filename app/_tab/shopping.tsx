import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BlogList from "../../components/shopping/BlogList";
import CategoryTabs, {
  CategoryType,
} from "../../components/shopping/CategoryTabs";
import DressGrid from "../../components/shopping/DressGrid";
import ShopList from "../../components/shopping/ShopList";
import { BlogPost, Dress, Shop } from "../../services/types";

export default function Shopping() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("DRESS");

  const handleDressPress = (dress: Dress) => {
    router.push(`/dress/${dress.id}` as any);
  };

  const handleShopPress = (shop: Shop) => {
    router.push(`/shop/${shop.id}` as any);
  };

  const handleBlogPress = (blog: BlogPost) => {
    router.push(`/blog/${blog.id}` as any);
  };

  const getHeaderTitle = () => {
    switch (selectedCategory) {
      case "DRESS":
        return "Váy cưới";
      case "SHOP":
        return "Cửa hàng";
      case "CUSTOM":
        return "Đặt may";
      case "BLOG":
        return "Blog";
      default:
        return "Khám phá";
    }
  };

  const renderContent = () => {
    switch (selectedCategory) {
      case "DRESS":
        return <DressGrid onDressPress={handleDressPress} />;
      case "SHOP":
        return <ShopList onShopPress={handleShopPress} />;
      case "CUSTOM":
        return (
          <View className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="bg-white px-6 py-8 shadow-sm">
              <View className="items-center">
                <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="cut-outline" size={40} color="#E05C78" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Dịch vụ đặt may
                </Text>
                <Text className="text-base text-gray-600 text-center leading-6">
                  Tùy chỉnh váy cưới theo ý muốn của bạn
                </Text>
              </View>
            </View>

            {/* Features Section */}
            <View className="px-6 py-6">
              <View className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      Thiết kế riêng
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Váy được thiết kế theo ý muốn của bạn
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="color-palette" size={24} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      Chất liệu cao cấp
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Sử dụng vải cao cấp, đảm bảo chất lượng
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="time" size={24} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      Giao hàng đúng hẹn
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Cam kết giao hàng đúng thời gian
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contact Buttons */}
              <View className="space-y-3">
                <TouchableOpacity
                  className="bg-primary-500 py-4 rounded-2xl items-center shadow-lg"
                  onPress={() => {
                    // TODO: Navigate to custom order form
                    console.log("Navigate to custom order form");
                  }}
                >
                  <Text className="text-white font-bold text-lg">
                    Đặt may ngay
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white py-4 rounded-2xl items-center border border-gray-200"
                  onPress={() => {
                    // TODO: Navigate to contact page
                    console.log("Navigate to contact");
                  }}
                >
                  <Text className="text-gray-700 font-semibold text-lg">
                    Liên hệ tư vấn
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case "BLOG":
        return <BlogList onBlogPress={handleBlogPress} />;
      default:
        return <DressGrid onDressPress={handleDressPress} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 70,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E05C78",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
});
