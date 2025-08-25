import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { LightStatusBar } from "../../components/StatusBar";
import { shopApi } from "../../services/apis/shop.api";
import { Accessory } from "../../services/types";
import { formatVNDCustom } from "../../utils/currency.util";

interface AccessoryDetail extends Accessory {
  description?: string;
  ratingCount?: number;
  feedbacks?: Array<{
    id: string;
    customer: { id: string; username: string; avatarUrl: string | null };
    content: string;
    rating: string;
    images: string | null;
  }>;
}

export default function AccessoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [accessory, setAccessory] = useState<AccessoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadAccessoryDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shopApi.getAccessoryById(id);

      let accessoryData: AccessoryDetail;
      if ("item" in response && response.item) {
        accessoryData = response.item as AccessoryDetail;
      } else {
        accessoryData = response as AccessoryDetail;
      }

      setAccessory(accessoryData);
    } catch (error) {
      console.error("Error loading accessory detail:", error);
      setAccessory(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAccessoryDetail();
  }, [loadAccessoryDetail]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Toast.show({
      type: "success",
      text1: isFavorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
    });
  };

  // const handleContact = () => {
  //   Toast.show({
  //     type: "info",
  //     text1: "Liên hệ",
  //     text2: "Bạn muốn liên hệ để mua hoặc thuê phụ kiện này?",
  //     onPress: () => {
  //       Toast.show({
  //         type: "info",
  //         text1: "Tùy chọn",
  //         text2: "Chọn hành động liên hệ",
  //         onPress: () => {
  //           // TODO: Implement call and message functionality
  //         },
  //       });
  //     },
  //   });
  // };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>Đang tải thông tin phụ kiện...</Text>
      </View>
    );
  }

  if (!accessory) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin phụ kiện</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-soft">
      <LightStatusBar />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-20 pb-4 bg-primary-600">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1 text-center mx-4">
          Chi tiết phụ kiện
        </Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          onPress={handleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#EF4444" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        <View className="relative h-72">
          <Image
            source={{
              uri:
                accessory.images?.[0] ||
                "https://via.placeholder.com/400x300?text=Phụ+kiện",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              {accessory.status === "AVAILABLE" ? "Có sẵn" : "Hết hàng"}
            </Text>
          </View>
        </View>

        {/* Accessory Info */}
        <View className="p-5">
          <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
            {accessory.name}
          </Text>

          <View className="flex-row items-center justify-center mb-6">
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">
              {accessory.ratingAverage}
            </Text>
            <Text className="text-sm text-gray-500 ml-1">đánh giá</Text>
          </View>

          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Giá cả
            </Text>

            {accessory.isSellable && (
              <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="shirt-outline" size={20} color="#E05C78" />
                  <Text className="text-base font-semibold text-gray-700 ml-2">
                    Giá mua
                  </Text>
                </View>
                <Text className="text-xl font-bold text-primary-500">
                  {formatVNDCustom(accessory.sellPrice)}
                </Text>
              </View>
            )}

            {accessory.isRentable && (
              <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg">
                <View className="flex-row items-center">
                  <Ionicons name="repeat-outline" size={20} color="#10B981" />
                  <Text className="text-base font-semibold text-gray-700 ml-2">
                    Giá thuê
                  </Text>
                </View>
                <Text className="text-xl font-bold text-green-600">
                  {formatVNDCustom(accessory.rentalPrice)}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Mô tả
          </Text>
          <Text className="text-sm text-gray-600 leading-6 mb-6">
            {accessory.description || "Đang cập nhật"}
          </Text>

          {/* Feedbacks Section */}
          {accessory.feedbacks && accessory.feedbacks.length > 0 && (
            <View className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Đánh giá từ khách hàng
              </Text>
              {accessory.feedbacks.map((feedback) => (
                <View key={feedback.id} className="mb-4">
                  <Text className="text-sm text-gray-600 mb-1">
                    {feedback.content}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Rating: {feedback.rating}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Shop Information */}
          {accessory.user?.shop && (
            <View className="bg-white p-4 rounded-lg shadow-lg mb-12">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin cửa hàng
              </Text>
              <Text className="text-base font-medium text-gray-700 mb-1">
                {accessory.user.shop.name}
              </Text>
              <Text className="text-sm text-gray-600">
                {accessory.user.shop.address}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Updated styles for a more professional look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#1F2937",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  infoContainer: {
    padding: 20,
  },
  accessoryName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  pricingSection: {
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 12,
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginLeft: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E05C78",
  },
  rentalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButton: {
    backgroundColor: "#E05C78",
  },
  chatButton: {
    backgroundColor: "#3B82F6",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },
  feedbackSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  feedbackItem: {
    marginBottom: 12,
  },
  feedbackContent: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  feedbackRating: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  shopInfoSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shopTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
});
