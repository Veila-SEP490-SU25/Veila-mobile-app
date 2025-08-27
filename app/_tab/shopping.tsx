import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DressGrid from "../../components/shopping/DressGrid";
import { BlogPost, Dress, Shop } from "../../services/types";
import { getTokens, getVeilaServerConfig } from "../../utils";

const API_URL = getVeilaServerConfig();

export default function Shopping() {
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async (endpoint: string) => {
    try {
      const { accessToken } = await getTokens();
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const loadFeaturedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const blogResponse = await makeRequest("/blogs?page=0&size=10");

      if (
        blogResponse &&
        blogResponse.items &&
        Array.isArray(blogResponse.items) &&
        blogResponse.items.length > 0
      ) {
        setFeaturedBlogs(blogResponse.items);
      } else {
        setFeaturedBlogs([
          {
            id: "fallback-1",
            title: "Mẫu blog 1 - Thiết kế váy cưới hiện đại",
            images: ["https://via.placeholder.com/200x112?text=Blog+1"],
            user: {
              shop: {
                id: "shop-1",
                name: "Shop Mẫu 1",
                address: "Hà Nội",
                logoUrl: "https://via.placeholder.com/160x80?text=Shop1",
                reputation: 100,
              },
            },
            category: {
              id: "cat-1",
              name: "blog",
              images: null,
              description: "BLOG",
              type: "BLOG",
            },
          },
          {
            id: "fallback-2",
            title: "Mẫu blog 2 - Xu hướng váy cưới 2024",
            images: ["https://via.placeholder.com/200x112?text=Blog+2"],
            user: {
              shop: {
                id: "shop-2",
                name: "Shop Mẫu 2",
                address: "TP.HCM",
                logoUrl: "https://via.placeholder.com/160x80?text=Shop2",
                reputation: 95,
              },
            },
            category: {
              id: "cat-2",
              name: "blog",
              images: null,
              description: "BLOG",
              type: "BLOG",
            },
          },
        ]);
      }

      const shopResponse = await makeRequest("/shops?page=0&size=10");

      if (
        shopResponse &&
        shopResponse.items &&
        Array.isArray(shopResponse.items) &&
        shopResponse.items.length > 0
      ) {
        setFeaturedShops(shopResponse.items);
      } else {
        setFeaturedShops([
          {
            id: "fallback-shop-1",
            name: "Shop Váy Cưới Đẹp",
            phone: "0123456789",
            email: "shop1@example.com",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            logoUrl: "https://via.placeholder.com/160x80?text=Shop+1",
            coverUrl: "https://via.placeholder.com/400x200?text=Cover+1",
            images: null,
          },
          {
            id: "fallback-shop-2",
            name: "Boutique Cưới Xinh",
            phone: "0987654321",
            email: "shop2@example.com",
            address: "456 Đường XYZ, Ba Đình, Hà Nội",
            logoUrl: "https://via.placeholder.com/160x80?text=Shop+2",
            coverUrl: "https://via.placeholder.com/400x200?text=Cover+2",
            images: null,
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Error loading featured data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setFeaturedBlogs([]);
      setFeaturedShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedData();
  }, [loadFeaturedData]);

  const handleDressPress = (dress: Dress) => {
    router.push(`/dress/${dress.id}` as any);
  };

  const handleShopPress = (shop: Shop) => {
    router.push(`/shop/${shop.id}` as any);
  };

  const handleBlogPress = (blog: BlogPost) => {
    router.push(`/blog/${blog.id}` as any);
  };

  const handleCustomRequest = () => {
    router.push("/account/custom-requests/create" as any);
  };

  const handleShopChat = () => {
    router.push("/_tab/chat" as any);
  };

  const handleViewAllBlogs = () => {
    router.push("/blog" as any);
  };

  const handleViewAllShops = () => {
    router.push("/shop" as any);
  };

  const renderUtilitySection = () => (
    <View className="bg-white mt-4 mx-4 mb-4 rounded-2xl border border-gray-200 shadow-soft">
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-700 mb-4">
          Tiện ích nhanh
        </Text>

        <View className="flex-row space-x-3">
          {/* Đặt may */}
          <TouchableOpacity
            onPress={handleCustomRequest}
            className="flex-1 items-center rounded-2xl py-4 px-3"
            style={{
              backgroundColor: "transparent",

            }}
          >
            <LinearGradient
              colors={["#E05C78", "#C04060"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 8,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Ionicons name="cut-outline" size={24} color="#FFFFFF" />
              <Text className="text-white font-semibold mt-2 text-center">
                Đặt may
              </Text>
              <Text className="text-white text-xs text-center opacity-90">
                Thiết kế riêng
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Nhắn tin */}
          <TouchableOpacity
            onPress={handleShopChat}
            className="flex-1 items-center rounded-2xl py-4 px-3"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <LinearGradient
              colors={["#5C78E0", "#3E5AC0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 8,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text className="text-white font-semibold mt-2 text-center">
                Nhắn tin
              </Text>
              <Text className="text-white text-xs text-center opacity-90">
                Tư vấn shop
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDressTabs = () => (
    <View className="bg-white mx-4 mb-4 rounded-2xl border border-gray-200 shadow-sm">
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Loại dịch vụ
        </Text>

        <View className="flex-row gap-x-3">
          {/* Mua váy */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
            onPress={() => router.push("/dresses/buy" as any)}
          >
            <Ionicons name="shirt-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold mt-1 text-sm">
              Mua váy
            </Text>
          </TouchableOpacity>

          {/* Thuê váy */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 bg-green-500 rounded-xl py-3 items-center"
            onPress={() => router.push("/dresses/rent" as any)}
          >
            <Ionicons name="repeat-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold mt-1 text-sm">
              Thuê váy
            </Text>
          </TouchableOpacity>

          {/* Đặt may */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-1 bg-orange-500 rounded-xl py-3 items-center"
            onPress={handleCustomRequest}
          >
            <Ionicons name="cut-outline" size={20} color="#fff" />
            <Text className="text-white font-semibold mt-1 text-sm">
              Đặt may
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBlogSlide = () => (
    <View className="bg-white mx-4 mb-5 rounded-2xl border border-gray-200 shadow-sm">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-800">
            Blog nổi bật
          </Text>
          <TouchableOpacity onPress={handleViewAllBlogs}>
            <Text className="text-primary-500 font-medium">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {featuredBlogs.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            decelerationRate="fast"
            snapToInterval={200}
          >
            {featuredBlogs.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="mr-4 w-48"
                onPress={() => handleBlogPress(item)}
                activeOpacity={0.85}
              >
                {/* Image */}
                <View className="bg-gray-100 rounded-xl h-28 mb-2 overflow-hidden border border-gray-200">
                  <Image
                    source={{
                      uri:
                        Array.isArray(item.images) &&
                        item.images.length > 0 &&
                        item.images[0]
                          ? item.images[0]
                          : "https://via.placeholder.com/200x112?text=Blog+1",
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Title */}
                <Text
                  className="text-sm font-medium text-gray-800 mb-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {/* Shop info */}
                {item.user?.shop && (
                  <View className="gap-1">
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 bg-primary-100 rounded-full mr-2" />
                      <Text className="text-xs text-gray-500" numberOfLines={1}>
                        {item.user.shop.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={10} color="#6B7280" />
                      <Text
                        className="text-xs text-gray-400 ml-1"
                        numberOfLines={1}
                      >
                        {item.user.shop.address}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="py-6 items-center bg-gray-50 rounded-xl">
            <Ionicons name="newspaper-outline" size={32} color="#D1D5DB" />
            <Text className="text-gray-500 mt-2 text-sm">Chưa có bài viết</Text>
            <Text className="text-xs text-gray-400 mt-1">
              API: {featuredBlogs.length} items
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderShopSlide = () => (
    <View className="bg-white mx-4 mb-4 rounded-2xl border border-gray-200 shadow-sm">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-800">
            Shop nổi bật
          </Text>
          <TouchableOpacity onPress={handleViewAllShops} activeOpacity={0.7}>
            <Text className="text-primary-500 font-medium">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {featuredShops.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            decelerationRate="fast"
            snapToInterval={160}
          >
            {featuredShops.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="mr-4 w-40"
                onPress={() => handleShopPress(item)}
                activeOpacity={0.8}
              >
                {/* Logo */}
                <View className="bg-gray-100 rounded-xl h-20 mb-2 overflow-hidden border border-gray-200">
                  <Image
                    source={{
                      uri:
                        item.logoUrl ||
                        "https://via.placeholder.com/160x80?text=Shop",
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Name */}
                <Text
                  className="text-sm font-medium text-gray-800 mb-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                {/* Location */}
                <View className="flex-row items-center">
                  <Ionicons name="location" size={10} color="#6B7280" />
                  <Text
                    className="text-xs text-gray-400 ml-1"
                    numberOfLines={1}
                  >
                    {item.address.split(",")[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="py-6 items-center bg-gray-50 rounded-xl">
            <Ionicons name="storefront-outline" size={32} color="#D1D5DB" />
            <Text className="text-gray-500 mt-2 text-sm">Chưa có shop</Text>
            <Text className="text-xs text-gray-400 mt-1">
              API: {featuredShops.length} items
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderContent = () => (
    <FlatList
      className="flex-1"
      showsVerticalScrollIndicator={false}
      data={[{ key: "content" }]}
      renderItem={() => (
        <View>
          {renderUtilitySection()}
          {renderDressTabs()}
          {renderBlogSlide()}
          {renderShopSlide()}
          <View className="mx-4 mb-4 rounded-2xl ">
            <DressGrid onDressPress={handleDressPress} />
          </View>
        </View>
      )}
      keyExtractor={(item) => item.key}
    />
  );

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
        <Text style={styles.headerTitle}>Khám phá váy cưới</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadFeaturedData}
        >
          <Ionicons name="refresh" size={20} color="#E05C78" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="refresh-outline" size={32} color="#E05C78" />
          <Text className="text-gray-500 mt-2 text-sm">
            Đang tải dữ liệu...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#E05C78" />
          <Text className="text-gray-800 mt-3 text-base font-medium text-center">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-4 bg-primary-500 px-6 py-3 rounded-xl"
            onPress={loadFeaturedData}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderContent()
      )}
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  utilitySection: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  utilityButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardSection: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
});
