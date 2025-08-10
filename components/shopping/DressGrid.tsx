import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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
import { dressApi } from "../../services/apis/dress.api";
import { shopApi } from "../../services/apis/shop.api";
import { Dress } from "../../services/types";

interface DressGridProps {
  shopId?: string;
  onDressPress: (dress: Dress) => void;
}

export default function DressGrid({ shopId, onDressPress }: DressGridProps) {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadDresses = useCallback(
    async (pageNum: number = 0, refresh: boolean = false) => {
      try {
        let response;
        if (shopId) {
          response = await shopApi.getShopDresses(shopId, pageNum, 10);
        } else {
          response = await dressApi.getDresses(pageNum, 10);
        }
        const newDresses = response.items;

        if (refresh) {
          setDresses(newDresses);
        } else {
          setDresses((prev) => [...prev, ...newDresses]);
        }

        setHasMore(response.hasNextPage);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading dresses:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [shopId]
  );

  useEffect(() => {
    loadDresses(0, true);
  }, [loadDresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDresses(0, true);
  }, [loadDresses]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadDresses(page + 1);
    }
  }, [hasMore, loading, loadDresses, page]);

  const renderDress = ({ item }: { item: Dress }) => (
    <TouchableOpacity
      style={styles.dressCard}
      onPress={() => onDressPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://via.placeholder.com/200x300?text=Váy+cưới",
          }}
          style={styles.dressImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        {item.status === "OUT_OF_STOCK" && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}
      </View>

      <View style={styles.dressInfo}>
        <Text style={styles.dressName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.ratingAverage}</Text>
        </View>

        <View style={styles.priceContainer}>
          {item.isSellable && (
            <Text style={styles.sellPrice}>Mua: {item.sellPrice}</Text>
          )}
          {item.isRentable && (
            <Text style={styles.rentPrice}>Thuê: {item.rentalPrice}</Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {item.isSellable && (
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Mua</Text>
            </TouchableOpacity>
          )}
          {item.isRentable && (
            <TouchableOpacity style={styles.rentButton}>
              <Text style={styles.rentButtonText}>Thuê</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && dresses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>Đang tải váy cưới...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={dresses}
      renderItem={renderDress}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
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
            <Ionicons name="shirt-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>Không có váy cưới nào</Text>
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
  row: {
    justifyContent: "space-between",
  },
  dressCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  dressImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  dressInfo: {
    padding: 12,
  },
  dressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  priceContainer: {
    marginBottom: 8,
  },
  sellPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E05C78",
    marginBottom: 2,
  },
  rentPrice: {
    fontSize: 12,
    color: "#666666",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: "#E05C78",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  rentButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  rentButtonText: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "600",
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
