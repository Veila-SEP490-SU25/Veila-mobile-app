import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
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

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    name: "",
    sort: "name:asc",
    size: 10,
    page: 0,
  });

  const loadShops = useCallback(
    async (pageNum: number = 0, refresh: boolean = false) => {
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
    },
    [filterOptions, searchQuery]
  );

  useEffect(() => {
    loadShops(0, true);
  }, [filterOptions.sort, filterOptions.size, loadShops]);

  useEffect(() => {

    const timeoutId = setTimeout(() => {
      if (searchQuery !== filterOptions.name) {
        setFilterOptions((prev) => ({ ...prev, name: searchQuery }));
        loadShops(0, true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadShops, filterOptions]);

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
    </View>
  );
}
