import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
      if (__DEV__) {
        console.error("Error loading shops:", error);
      }
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách cửa hàng",
      });
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
        setFilterOptions((prev) => ({ ...prev, name: searchQuery }));
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
    setFilterOptions((prev) => ({ ...prev, sort: sortOption, page: 0 }));
    setShowFilters(false);
  };

  const handleSizeChange = (size: number) => {
    setFilterOptions((prev) => ({ ...prev, size, page: 0 }));
    setShowFilters(false);
  };

  const renderShop = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 shadow-card overflow-hidden"
      onPress={() => onShopPress(item)}
      activeOpacity={0.8}
    >
      <View className="relative">
        <Image
          source={{
            uri:
              item.coverUrl ||
              item.logoUrl ||
              "https://via.placeholder.com/300x200?text=Cửa+hàng",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/20" />
        <View className="absolute top-4 right-4">
          <View className="w-16 h-16 bg-white rounded-full p-1 shadow-lg">
            <Image
              source={{
                uri:
                  item.logoUrl || "https://via.placeholder.com/60x60?text=Logo",
              }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          </View>
        </View>
        <View className="absolute top-4 left-4">
          <View className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex-row items-center">
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text className="text-sm font-semibold text-gray-700 ml-1">
              4.5
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        <Text
          className="text-lg font-bold text-gray-800 mb-3"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <View className="space-y-2 mb-4">
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={16} color="#666666" />
            <Text
              className="text-sm text-gray-600 ml-2 flex-1"
              numberOfLines={1}
            >
              {item.phone}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={16} color="#666666" />
            <Text
              className="text-sm text-gray-600 ml-2 flex-1"
              numberOfLines={1}
            >
              {item.email}
            </Text>
          </View>

          <View className="flex-row items-start">
            <Ionicons
              name="location-outline"
              size={16}
              color="#666666"
              className="mt-0.5"
            />
            <Text
              className="text-sm text-gray-600 ml-2 flex-1"
              numberOfLines={2}
            >
              {item.address}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-100 pt-3">
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
            onPress={() => onShopPress(item)}
          >
            <Text className="text-white font-semibold text-base mr-2">
              Ghé cửa hàng
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && shops.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="text-lg text-gray-600 mt-4 font-medium">
          Đang tải cửa hàng...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search and Filter Header */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mr-3">
            <Ionicons
              name="search"
              size={20}
              color="#666666"
              className="mr-3"
            />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Tìm kiếm cửa hàng..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className="p-1"
                onPress={() => setSearchQuery("")}
              >
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className="bg-white border border-primary-500 rounded-2xl px-4 py-3 flex-row items-center"
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#E05C78" />
            <Text className="text-primary-500 font-semibold ml-2">Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Results Info */}
        <View className="border-t border-gray-100 pt-3">
          <Text className="text-center text-gray-600">
            {shops.length} cửa hàng
            {searchQuery && ` cho "${searchQuery}"`}
          </Text>
        </View>
      </View>

      <FlatList
        data={shops}
        renderItem={renderShop}
        keyExtractor={(item) => item.id}
        className="px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          hasMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#E05C78" />
              <Text className="text-gray-600 mt-2">Đang tải thêm...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center p-12">
              <Ionicons name="storefront-outline" size={80} color="#CCCCCC" />
              <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
                Không tìm thấy cửa hàng nào
              </Text>
              <Text className="text-base text-gray-400 mt-2 text-center">
                {searchQuery
                  ? `Không có cửa hàng nào phù hợp với "${searchQuery}"`
                  : "Hãy thử tìm kiếm với từ khóa khác"}
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
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-6 w-11/12 max-w-sm">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-800">Bộ lọc</Text>
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Sắp xếp theo
              </Text>
              <View className="flex-row justify-around bg-gray-100 rounded-2xl p-2">
                <TouchableOpacity
                  className={`py-3 px-6 rounded-xl ${
                    filterOptions.sort === "name:asc"
                      ? "bg-primary-500 border border-primary-500"
                      : ""
                  }`}
                  onPress={() => handleSortChange("name:asc")}
                >
                  <Text
                    className={`font-semibold ${
                      filterOptions.sort === "name:asc"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Tên A-Z
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`py-3 px-6 rounded-xl ${
                    filterOptions.sort === "name:desc"
                      ? "bg-primary-500 border border-primary-500"
                      : ""
                  }`}
                  onPress={() => handleSortChange("name:desc")}
                >
                  <Text
                    className={`font-semibold ${
                      filterOptions.sort === "name:desc"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    Tên Z-A
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Size Options */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Số lượng mỗi trang
              </Text>
              <View className="flex-row justify-around bg-gray-100 rounded-2xl p-2">
                {[5, 10, 15, 20].map((size) => (
                  <TouchableOpacity
                    key={size}
                    className={`py-3 px-6 rounded-xl ${
                      filterOptions.size === size
                        ? "bg-primary-500 border border-primary-500"
                        : ""
                    }`}
                    onPress={() => handleSizeChange(size)}
                  >
                    <Text
                      className={`font-semibold ${
                        filterOptions.size === size
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              className="bg-primary-500 rounded-2xl py-4 px-6 w-full"
              onPress={() => setShowFilters(false)}
            >
              <Text className="text-white font-bold text-lg text-center">
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
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
