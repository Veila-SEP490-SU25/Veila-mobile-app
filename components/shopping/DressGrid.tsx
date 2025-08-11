import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { dressApi } from "../../services/apis/dress.api";
import { shopApi } from "../../services/apis/shop.api";
import { Dress } from "../../services/types/dress.type";

interface DressGridProps {
  shopId?: string;
  onDressPress: (dress: Dress) => void;
}

type Mode = "buy" | "rent";
export default function DressGrid({ shopId, onDressPress }: DressGridProps) {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [mode, setMode] = useState<Mode>("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name:asc");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadDresses = useCallback(
    async (pageNum: number = 0, refresh: boolean = false) => {
      try {
        setLoading(pageNum === 0 && !refresh ? true : loading);
        let newResponse;
        if (shopId) {
          newResponse = await shopApi.getShopDresses(shopId, pageNum, 10);
        } else {
          newResponse = await dressApi.getDresses({
            page: pageNum,
            size: 10,
            sort: sortBy,
            filter: debouncedSearchQuery
              ? `name:like:${debouncedSearchQuery}`
              : undefined,
          });
        }
        const newDresses = newResponse.items;

        if (refresh || pageNum === 0) {
          setDresses(newDresses);
        } else {
          setDresses((prev) => {
            const existingIds = new Set(prev.map((d) => d.id));
            const merged = newDresses.filter((d) => !existingIds.has(d.id));
            return [...prev, ...merged];
          });
        }

        setHasMore(newResponse.hasNextPage);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading dresses:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearchQuery, sortBy, shopId, loading]
  );

  useEffect(() => {
    loadDresses(0, true);
  }, [loadDresses]);

  // Reset page on sort/mode change (mode just toggles price display)
  useEffect(() => {
    setPage(0);
    loadDresses(0, true);
  }, [sortBy, loadDresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    loadDresses(0, true);
  }, [loadDresses]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadDresses(page + 1);
    }
  }, [hasMore, loading, loadDresses, page]);

  const renderPrice = useCallback(
    (item: Dress) => {
      if (mode === "buy") {
        return item.isSellable ? (
          <Text style={styles.sellPrice}>Mua: {item.sellPrice}</Text>
        ) : (
          <Text style={styles.unavailableText}>Không bán</Text>
        );
      }
      return item.isRentable ? (
        <Text style={styles.rentPrice}>Thuê: {item.rentalPrice}</Text>
      ) : (
        <Text style={styles.unavailableText}>Không cho thuê</Text>
      );
    },
    [mode]
  );

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

        <View style={styles.priceContainer}>{renderPrice(item)}</View>

        {/* Shop info short */}
        {item.user?.shop && (
          <View style={styles.shopRow}>
            <Image
              source={{ uri: item.user.shop.logoUrl! }}
              style={styles.shopLogoMini}
            />
            <Text style={styles.shopNameMini} numberOfLines={1}>
              {item.user.shop.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
      {/* Sub tabs Buy/Rent */}
      <View style={styles.subTabsContainer}>
        {[
          { key: "buy", label: "Mua" },
          { key: "rent", label: "Thuê" },
        ].map((t) => {
          const active = mode === (t.key as Mode);
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.subTab, active && styles.subTabActive]}
              onPress={() => setMode(t.key as Mode)}
            >
              <Text
                style={[styles.subTabText, active && styles.subTabTextActive]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên váy..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#aaa"
          selectionColor="#E05C78"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        {["name:asc", "name:desc"].map((s) => {
          const active = sortBy === s;
          const label = s === "name:asc" ? "A-Z" : "Z-A";
          return (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, active && styles.sortChipActive]}
              onPress={() => setSortBy(s)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  active && styles.sortChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
      ListHeaderComponent={renderHeader}
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
            <Text style={styles.emptySubtext}>Hãy thử từ khóa khác</Text>
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
  subTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
    gap: 6,
    marginBottom: 10,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  subTabActive: {
    backgroundColor: "#E05C78",
  },
  subTabText: {
    fontWeight: "600",
    color: "#666",
  },
  subTabTextActive: {
    color: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: "#333",
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortChipActive: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
  },
  sortChipText: {
    color: "#374151",
    fontWeight: "600",
  },
  sortChipTextActive: {
    color: "#fff",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  unavailableText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  shopLogoMini: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  shopNameMini: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
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
