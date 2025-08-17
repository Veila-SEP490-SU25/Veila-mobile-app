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

export default function AccessoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadAccessoryDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shopApi.getAccessoryById(id);
      setAccessory(response);
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

  const handleContact = () => {
    Toast.show({
      type: "info",
      text1: "Liên hệ",
      text2: "Bạn muốn liên hệ để mua hoặc thuê phụ kiện này?",
      onPress: () => {
        Toast.show({
          type: "info",
          text1: "Tùy chọn",
          text2: "Chọn hành động liên hệ",
          onPress: () => {
            // TODO: Implement call and message functionality
          },
        });
      },
    });
  };

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
    <View style={styles.container}>
      <LightStatusBar />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết phụ kiện
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#EF4444" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                accessory.images?.[0] ||
                "https://via.placeholder.com/400x300?text=Phụ+kiện",
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {accessory.status === "AVAILABLE" ? "Có sẵn" : "Hết hàng"}
            </Text>
          </View>
        </View>

        {/* Accessory Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.accessoryName}>{accessory.name}</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{accessory.ratingAverage}</Text>
            <Text style={styles.ratingLabel}>đánh giá</Text>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Giá cả</Text>

            {accessory.isSellable && (
              <View style={styles.priceItem}>
                <View style={styles.priceHeader}>
                  <Ionicons name="shirt-outline" size={20} color="#E05C78" />
                  <Text style={styles.priceLabel}>Giá mua</Text>
                </View>
                <Text style={styles.priceValue}>
                  {formatVNDCustom(accessory.sellPrice)}
                </Text>
              </View>
            )}

            {accessory.isRentable && (
              <View style={styles.priceItem}>
                <View style={styles.priceHeader}>
                  <Ionicons name="repeat-outline" size={20} color="#10B981" />
                  <Text style={styles.priceLabel}>Giá thuê</Text>
                </View>
                <Text style={styles.rentalValue}>
                  {formatVNDCustom(accessory.rentalPrice)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.contactButton]}
              onPress={handleContact}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Liên hệ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton]}
              onPress={() => router.push("/_tab/chat" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#E05C78",
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
    fontSize: 18,
    fontWeight: "600",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
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
});
