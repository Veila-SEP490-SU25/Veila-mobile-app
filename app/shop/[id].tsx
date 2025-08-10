import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CategoryTabs, {
  CategoryType,
} from "../../components/shopping/CategoryTabs";
import DressGrid from "../../components/shopping/DressGrid";
import { shopApi } from "../../services/apis/shop.api";
import { Dress, ShopDetail } from "../../services/types";

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("DRESS");

  const loadShopDetail = useCallback(async () => {
    try {
      if (!id) return;
      const shopData = await shopApi.getShopById(id);
      setShop(shopData);
    } catch (error) {
      console.error("Error loading shop detail:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadShopDetail();
  }, [loadShopDetail]);

  const handleDressPress = useCallback((dress: Dress) => {
    Alert.alert("Váy cưới", `Bạn đã chọn: ${dress.name}`);
    // TODO: Navigate to dress detail
  }, []);

  const handleContact = useCallback(() => {
    if (shop) {
      Alert.alert(
        "Liên hệ",
        `Điện thoại: ${shop.phone}\nEmail: ${shop.email}\nĐịa chỉ: ${shop.address}`,
        [
          { text: "Gọi điện", onPress: () => console.log("Call pressed") },
          { text: "Nhắn tin", onPress: () => console.log("Message pressed") },
          { text: "Đóng", style: "cancel" },
        ]
      );
    }
  }, [shop]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>Đang tải thông tin cửa hàng...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin cửa hàng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {shop.name}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri:
                shop.coverUrl ||
                shop.images?.[0] ||
                "https://via.placeholder.com/400x200?text=Cửa+hàng",
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri:
                    shop.logoUrl ||
                    "https://via.placeholder.com/80x80?text=Logo",
                }}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Shop Info */}
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopDescription}>{shop.description}</Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color="#666666" />
              <Text style={styles.contactText}>{shop.phone}</Text>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color="#666666" />
              <Text style={styles.contactText}>{shop.email}</Text>
            </View>

            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={16} color="#666666" />
              <Text style={styles.contactText}>{shop.address}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Content based on selected category */}
        <View style={styles.contentContainer}>
          {selectedCategory === "DRESS" && (
            <DressGrid shopId={id} onDressPress={handleDressPress} />
          )}
          {selectedCategory === "ACCESSORY" && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Phụ kiện - Đang phát triển
              </Text>
            </View>
          )}
          {selectedCategory === "SERVICE" && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Dịch vụ - Đang phát triển
              </Text>
            </View>
          )}
          {selectedCategory === "BLOG" && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Blog - Đang phát triển</Text>
            </View>
          )}
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
  shareButton: {
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
  coverContainer: {
    position: "relative",
    height: 200,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  shopInfo: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  shopName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  shopDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
    flex: 1,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E05C78",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
});
