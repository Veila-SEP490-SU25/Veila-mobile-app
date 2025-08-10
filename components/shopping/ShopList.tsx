import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { shopApi } from "../../services/apis/shop.api";
import { Shop } from "../../services/types";

interface ShopListProps {
  onShopPress: (shop: Shop) => void;
}

export default function ShopList({ onShopPress }: ShopListProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadShops = async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      const response = await shopApi.getShops(pageNum, 10);
      const newShops = response.items;

      if (refresh) {
        setShops(newShops);
      } else {
        setShops((prev) => [...prev, ...newShops]);
      }

      setHasMore(response.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading shops:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadShops(0, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadShops(0, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadShops(page + 1);
    }
  };

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => onShopPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.coverUrl ||
              item.logoUrl ||
              "https://via.placeholder.com/300x200?text=Cửa+hàng",
          }}
          style={styles.shopImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri:
                  item.logoUrl || "https://via.placeholder.com/60x60?text=Logo",
              }}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <View style={styles.shopInfo}>
        <Text style={styles.shopName} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={14} color="#666666" />
            <Text style={styles.contactText} numberOfLines={1}>
              {item.phone}
            </Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={14} color="#666666" />
            <Text style={styles.contactText} numberOfLines={1}>
              {item.email}
            </Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={14} color="#666666" />
            <Text style={styles.contactText} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onShopPress(item)}
          >
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#E05C78" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && shops.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>Đang tải cửa hàng...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={shops}
      renderItem={renderShop}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={
        hasMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#E05C78" />
            <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>Không có cửa hàng nào</Text>
            <Text style={styles.emptySubtext}>
              Hãy thử tìm kiếm với từ khóa khác
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shopCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  shopImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    borderRadius: 26,
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
    flex: 1,
  },
  actionContainer: {
    alignItems: "center",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E05C78",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E05C78",
    marginRight: 4,
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
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});
