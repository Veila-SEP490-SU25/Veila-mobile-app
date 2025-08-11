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
      case "ACCESSORY":
        return "Phụ kiện";
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
      case "ACCESSORY":
        return (
          <View className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="bg-white px-6 py-8 shadow-sm">
              <View className="items-center">
                <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="diamond-outline" size={40} color="#E05C78" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Phụ kiện cưới
                </Text>
                <Text className="text-base text-gray-600 text-center leading-6">
                  Khám phá bộ sưu tập phụ kiện đẹp mắt
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
                      Chất lượng cao
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Phụ kiện được làm từ chất liệu tốt nhất
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="sparkles" size={24} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      Thiết kế độc đáo
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Mỗi phụ kiện đều có thiết kế riêng biệt
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="star" size={24} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      Giá cả hợp lý
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Chất lượng tốt với mức giá phù hợp
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-2xl p-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Phụ kiện phổ biến
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={20} color="#E05C78" />
                    <Text className="text-base text-gray-700 ml-3">Vòng tay</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={20} color="#E05C78" />
                    <Text className="text-base text-gray-700 ml-3">Vòng cổ</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={20} color="#E05C78" />
                    <Text className="text-base text-gray-700 ml-3">Bông tai</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="diamond" size={20} color="#E05C78" />
                    <Text className="text-base text-gray-700 ml-3">Vương miện</Text>
                  </View>
                </View>
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
