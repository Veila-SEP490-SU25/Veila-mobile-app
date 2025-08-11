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
import { dressApi } from "../../services/apis/dress.api";
import { shopApi } from "../../services/apis/shop.api";
import { Dress } from "../../services/types/dress.type";

export default function DressDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dress, setDress] = useState<Dress | null>(null);
  const [shop, setShop] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDressDetail = useCallback(async () => {
    try {
      if (!id) return;
      const dressData = await dressApi.getDressById(id as string);
      setDress(dressData);
      // Ưu tiên lấy shop từ dữ liệu dress mới (user.shop)
      if ((dressData as any)?.user?.shop) {
        setShop((dressData as any).user.shop);
      } else if ((dressData as any).shopId) {
        const shopData = await shopApi.getShopById((dressData as any).shopId);
        setShop(shopData);
      }
    } catch {
      setDress(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDressDetail();
  }, [loadDressDetail]);

  const handleShopPress = useCallback(() => {
    if (shop?.id) router.push(`/shop/${shop.id}` as any);
  }, [shop]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>Đang tải thông tin váy cưới...</Text>
      </View>
    );
  }

  if (!dress) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin váy cưới</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết váy cưới
        </Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#E05C78" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                dress.images?.[0] ||
                "https://via.placeholder.com/400x600?text=Váy+cưới",
            }}
            style={styles.dressImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.dressName}>{dress.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.sellPrice}>
              {dress.isSellable ? `Mua: ${dress.sellPrice}` : "Không bán"}
            </Text>
            <Text style={styles.rentPrice}>
              {dress.isRentable
                ? `Thuê: ${dress.rentalPrice}`
                : "Không cho thuê"}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{dress.ratingAverage}</Text>
            <Text style={styles.statusText}>
              {dress.status === "AVAILABLE"
                ? "Còn hàng"
                : dress.status === "OUT_OF_STOCK"
                  ? "Hết hàng"
                  : "Không khả dụng"}
            </Text>
          </View>

          {/* Shop info dưới giống blog */}
          {shop && (
            <TouchableOpacity style={styles.shopCard} onPress={handleShopPress}>
              <Image
                source={{
                  uri:
                    shop.logoUrl ||
                    "https://via.placeholder.com/60x60?text=Logo",
                }}
                style={styles.shopLogo}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopAddress}>{shop.address}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text
                    style={{
                      marginLeft: 6,
                      color: "#6B7280",
                      fontWeight: "600",
                    }}
                  >
                    Đánh giá: {shop.reputation ?? "-"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#E05C78" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.chatButton}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.chatButtonText}>Nhắn tin với shop</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
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
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  imageContainer: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#F9F9F9",
  },
  dressImage: { width: "100%", height: "100%" },
  infoContainer: { padding: 20 },
  dressName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
  },
  priceRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
  sellPrice: { fontSize: 16, fontWeight: "700", color: "#E05C78" },
  rentPrice: { fontSize: 16, fontWeight: "700", color: "#10B981" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  ratingText: { fontSize: 14, color: "#666666", marginLeft: 4 },
  statusText: {
    fontSize: 14,
    color: "#E05C78",
    marginLeft: 12,
    fontWeight: "600",
  },
  shopCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  shopLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  shopName: { fontSize: 16, fontWeight: "700", color: "#333333" },
  shopAddress: { fontSize: 12, color: "#666666" },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E05C78",
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 12,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666666" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { fontSize: 16, color: "#666666" },
});
