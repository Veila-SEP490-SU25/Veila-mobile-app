import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { dressApi } from "../../services/apis/dress.api";
import { shopApi } from "../../services/apis/shop.api";
import { Dress } from "../../services/types/dress.type";
import { formatVNDCustom } from "../../utils/currency.util";

interface DressGridProps {
  shopId?: string;
  onDressPress: (dress: Dress) => void;
  disableScroll?: boolean;
  mode?: Mode;
}

type Mode = "buy" | "rent";

interface FilterOptions {
  name?: string;
  sort?: string;
  size: number;
  page: number;
  mode?: Mode;
}

export default function DressGrid({
  shopId,
  onDressPress,
  disableScroll = false,
  mode: initialMode = "buy",
}: DressGridProps) {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    name: "",
    sort: "name:asc",
    size: 10,
    page: 0,
    mode: "buy",
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setFilterOptions((prev) => ({ ...prev, page: 0 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadDresses = useCallback(
    async (pageNum: number = 0, refresh: boolean = false) => {
      try {
        setLoading(pageNum === 0 && !refresh ? true : loading);
        let newResponse;
        if (shopId) {
          newResponse = await shopApi.getShopDresses(
            shopId,
            pageNum,
            filterOptions.size
          );
        } else {
          newResponse = await dressApi.getDresses({
            page: pageNum,
            size: filterOptions.size,
            sort: filterOptions.sort,
            filter: debouncedSearchQuery
              ? `name:like:${debouncedSearchQuery}`
              : undefined,
          });
        }

        let newDresses = newResponse.items;

        if (mode === "buy") {
          newDresses = newDresses.filter((d) => d.isSellable);
        } else if (mode === "rent") {
          newDresses = newDresses.filter((d) => d.isRentable);
        }

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
        setFilterOptions((prev) => ({ ...prev, page: pageNum }));
      } catch (error) {
        if (__DEV__) {
          console.error("Error loading dresses:", error);
        }
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải danh sách váy cưới",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      debouncedSearchQuery,
      filterOptions.sort,
      filterOptions.size,
      shopId,
      loading,
      mode,
    ]
  );

  useEffect(() => {
    loadDresses(0, true);
  }, [loadDresses]);

  useEffect(() => {
    setFilterOptions((prev) => ({ ...prev, page: 0 }));
    loadDresses(0, true);
  }, [filterOptions.sort, mode, loadDresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFilterOptions((prev) => ({ ...prev, page: 0 }));
    loadDresses(0, true);
  }, [loadDresses]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadDresses(filterOptions.page + 1);
    }
  }, [hasMore, loading, loadDresses, filterOptions.page]);

  const handleSortChange = (sortOption: string) => {
    setFilterOptions((prev) => ({ ...prev, sort: sortOption, page: 0 }));
    setShowFilters(false);
  };

  const handleSizeChange = (size: number) => {
    setFilterOptions((prev) => ({ ...prev, size, page: 0 }));
    setShowFilters(false);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setFilterOptions((prev) => ({ ...prev, page: 0 }));
  };

  const renderPrice = useCallback(
    (item: Dress) => {
      if (mode === "buy") {
        return item.isSellable ? (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá:</Text>
            <Text style={styles.priceValue}>
              {formatVNDCustom(item.sellPrice, "₫")}
            </Text>
          </View>
        ) : (
          <View style={styles.noPriceContainer}>
            <Text style={styles.noPriceText}>Không bán</Text>
          </View>
        );
      }
      return item.isRentable ? (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Giá thuê:</Text>
          <Text style={styles.rentalValue}>
            {formatVNDCustom(item.rentalPrice, "₫")}
          </Text>
        </View>
      ) : (
        <View style={styles.noPriceContainer}>
          <Text style={styles.noPriceText}>Không cho thuê</Text>
        </View>
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
        {item.status === "OUT_OF_STOCK" && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}
        {/* Mode badge */}
        <View
          style={[
            styles.modeBadge,
            mode === "buy" ? styles.buyBadge : styles.rentBadge,
          ]}
        >
          <Text style={styles.modeBadgeText}>
            {mode === "buy" ? "MUA" : "THUÊ"}
          </Text>
        </View>
      </View>

      <View style={styles.dressContent}>
        <Text style={styles.dressName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.ratingAverage}</Text>
          <Text style={styles.ratingCount}>
            ({Math.floor(Math.random() * 100) + 20})
          </Text>
        </View>

        {renderPrice(item)}

        {/* Shop info short */}
        {item.user?.shop && (
          <View style={styles.shopInfo}>
            <Image
              source={{ uri: item.user.shop.logoUrl! }}
              style={styles.shopLogo}
            />
            <View style={styles.shopDetails}>
              <Text style={styles.shopName} numberOfLines={1}>
                {item.user.shop.name}
              </Text>
              <View style={styles.shopRating}>
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text style={styles.shopRatingText}>
                  {Math.floor(Math.random() * 50) + 50}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Mode Filter */}
      <View style={styles.modeFilter}>
        <Text style={styles.filterLabel}>Loại dịch vụ:</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "buy" && styles.activeModeButton,
            ]}
            onPress={() => handleModeChange("buy")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shirt-outline"
              size={16}
              color={mode === "buy" ? "#FFFFFF" : "#E05C78"}
            />
            <Text
              style={[
                styles.modeButtonText,
                mode === "buy" && styles.activeModeButtonText,
              ]}
            >
              Mua váy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "rent" && styles.activeModeButton,
            ]}
            onPress={() => handleModeChange("rent")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="repeat-outline"
              size={16}
              color={mode === "rent" ? "#FFFFFF" : "#10B981"}
            />
            <Text
              style={[
                styles.modeButtonText,
                mode === "rent" && styles.activeModeButtonText,
              ]}
            >
              Thuê váy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchFilterRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Tìm kiếm váy cưới để ${mode === "buy" ? "mua" : "thuê"}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="filter" size={20} color="#E05C78" />
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {dresses.length} váy cưới để {mode === "buy" ? "mua" : "thuê"}
          {searchQuery && ` cho "${searchQuery}"`}
        </Text>
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
    <View style={styles.container}>
      <FlatList
        data={dresses}
        renderItem={renderDress}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.dressRow}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#E05C78" />
              <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="shirt-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>
                Không có váy cưới nào để {mode === "buy" ? "mua" : "thuê"}
              </Text>
              <Text style={styles.emptySubtitle}>
                Hãy thử từ khóa khác hoặc chuyển loại dịch vụ
              </Text>
            </View>
          ) : null
        }
        scrollEnabled={!disableScroll}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filterOptions.sort === "name:asc" &&
                      styles.activeSortOption,
                  ]}
                  onPress={() => handleSortChange("name:asc")}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      filterOptions.sort === "name:asc" &&
                        styles.activeSortOptionText,
                    ]}
                  >
                    Tên A-Z
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filterOptions.sort === "name:desc" &&
                      styles.activeSortOption,
                  ]}
                  onPress={() => handleSortChange("name:desc")}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      filterOptions.sort === "name:desc" &&
                        styles.activeSortOptionText,
                    ]}
                  >
                    Tên Z-A
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Size Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Số lượng mỗi trang</Text>
              <View style={styles.sizeOptions}>
                {[5, 10, 15, 20].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      filterOptions.size === size && styles.activeSizeOption,
                    ]}
                    onPress={() => handleSizeChange(size)}
                  >
                    <Text
                      style={[
                        styles.sizeOptionText,
                        filterOptions.size === size &&
                          styles.activeSizeOptionText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  dressCard: {
    width: "48%",
    backgroundColor: "#fff",
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
    width: "100%",
    height: 200,
  },
  dressImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 18,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  outOfStockBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modeBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buyBadge: {
    backgroundColor: "#E05C78",
  },
  rentBadge: {
    backgroundColor: "#10B981",
  },
  modeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  dressContent: {
    padding: 16,
  },
  dressName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: "#F59E0B",
    marginLeft: 6,
    fontWeight: "600",
  },
  ratingCount: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  priceContainer: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E05C78",
  },
  rentalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  noPriceContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  noPriceText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  shopLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  shopRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  shopRatingText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 4,
  },
  header: {
    backgroundColor: "#fff",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 16,
  },
  modeFilter: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  modeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeModeButton: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  activeModeButtonText: {
    color: "#FFFFFF",
  },
  searchFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginLeft: 12,
  },
  filterButtonText: {
    color: "#E05C78",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultsInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#f0f0f0",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  activeSortOption: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeSortOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  sizeOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sizeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  activeSizeOption: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
  },
  sizeOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeSizeOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: "#E05C78",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loadMoreText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  dressRow: {
    justifyContent: "space-between",
  },
  listContainer: {
    paddingBottom: 20,
  },
});
