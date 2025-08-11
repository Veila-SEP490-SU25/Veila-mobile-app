import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
  Modal,
  Alert,
} from "react-native";
import { shopApi } from "../../services/apis/shop.api";
import { Shop } from "../../services/types";

interface ShopListProps {
  onShopPress: (shop: Shop) => void;
}

interface FilterOptions {
  name?: string;
  sort?: string;
  size: number;
  page: number;
}

export default function ShopList({ onShopPress }: ShopListProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    name: "",
    sort: "name:asc",
    size: 10,
    page: 0,
  });

  const loadShops = async (pageNum: number = 0, refresh: boolean = false) => {
    try {
      const currentFilters = {
        ...filterOptions,
        page: pageNum,
        name: searchQuery ? `name:like:${searchQuery}` : undefined,
      };

      const response = await shopApi.getShops(
        currentFilters.page,
        currentFilters.size,
        currentFilters.name,
        currentFilters.sort
      );
      
      const newShops = response.items;

      if (refresh) {
        setShops(newShops);
      } else {
        setShops((prev) => [...prev, ...newShops]);
      }

      setHasMore(response.hasNextPage);
    } catch (error) {
      console.error("Error loading shops:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách cửa hàng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadShops(0, true);
  }, [filterOptions.sort, filterOptions.size]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filterOptions.name) {
        setFilterOptions(prev => ({ ...prev, name: searchQuery }));
        loadShops(0, true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadShops(0, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadShops(filterOptions.page + 1);
    }
  };

  const handleSortChange = (sortOption: string) => {
    setFilterOptions(prev => ({ ...prev, sort: sortOption, page: 0 }));
    setShowFilters(false);
  };

  const handleSizeChange = (size: number) => {
    setFilterOptions(prev => ({ ...prev, size, page: 0 }));
    setShowFilters(false);
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
        <View style={styles.ratingContainer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.5</Text>
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
    <View style={styles.mainContainer}>
      {/* Search and Filter Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cửa hàng..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#E05C78" />
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {shops.length} cửa hàng
          {searchQuery && ` cho "${searchQuery}"`}
        </Text>
      </View>

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
              <Text style={styles.emptyText}>Không tìm thấy cửa hàng nào</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? `Không có cửa hàng nào phù hợp với "${searchQuery}"`
                  : "Hãy thử tìm kiếm với từ khóa khác"
                }
              </Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                    filterOptions.sort === "name:asc" && styles.activeSortOption
                  ]}
                  onPress={() => handleSortChange("name:asc")}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filterOptions.sort === "name:asc" && styles.activeSortOptionText
                  ]}>
                    Tên A-Z
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filterOptions.sort === "name:desc" && styles.activeSortOption
                  ]}
                  onPress={() => handleSortChange("name:desc")}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filterOptions.sort === "name:desc" && styles.activeSortOptionText
                  ]}>
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
                      filterOptions.size === size && styles.activeSizeOption
                    ]}
                    onPress={() => handleSizeChange(size)}
                  >
                    <Text style={[
                      styles.sizeOptionText,
                      filterOptions.size === size && styles.activeSizeOptionText
                    ]}>
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
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E05C78",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E05C78",
    marginLeft: 4,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultsText: {
    fontSize: 14,
    color: "#666666",
  },
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
  ratingContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  closeButton: {
    padding: 5,
  },
  filterSection: {
    width: "100%",
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  sortOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 5,
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeSortOption: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  activeSortOptionText: {
    color: "#FFFFFF",
  },
  sizeOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 5,
  },
  sizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeSizeOption: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
    borderWidth: 1,
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  activeSizeOptionText: {
    color: "#FFFFFF",
  },
  applyButton: {
    backgroundColor: "#E05C78",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
