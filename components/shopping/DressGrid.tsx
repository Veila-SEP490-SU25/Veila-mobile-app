import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
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
  onCustomRequestPress?: () => void;
  onChatPress?: () => void;
}

type Mode = "buy" | "rent";

interface FilterOptions {
  name?: string;
  sort?: string;
  size: number;
  page: number;
}

export default function DressGrid({
  shopId,
  onDressPress,
  onCustomRequestPress,
  onChatPress,
}: DressGridProps) {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mode, setMode] = useState<Mode>("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    name: "",
    sort: "name:asc",
    size: 10,
    page: 0,
  });

  // Debounce search
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
        setFilterOptions((prev) => ({ ...prev, page: pageNum }));
      } catch (error) {
        console.error("Error loading dresses:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách váy cưới");
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
    ]
  );

  useEffect(() => {
    loadDresses(0, true);
  }, [loadDresses]);

  // Reset page on sort/mode change
  useEffect(() => {
    setFilterOptions((prev) => ({ ...prev, page: 0 }));
    loadDresses(0, true);
  }, [filterOptions.sort, loadDresses]);

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

  const renderPrice = useCallback(
    (item: Dress) => {
      if (mode === "buy") {
        return item.isSellable ? (
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-semibold text-gray-700 mr-2">
              Mua:
            </Text>
            <Text className="text-base font-bold text-primary-500">
              {item.sellPrice}đ
            </Text>
          </View>
        ) : (
          <View className="mb-1">
            <Text className="text-sm text-gray-400 font-medium italic">
              Không bán
            </Text>
          </View>
        );
      }
      return item.isRentable ? (
        <View className="flex-row items-center mb-1">
          <Text className="text-sm font-semibold text-gray-700 mr-2">
            Thuê:
          </Text>
          <Text className="text-base font-bold text-green-600">
            {item.rentalPrice}đ
          </Text>
        </View>
      ) : (
        <View className="mb-1">
          <Text className="text-sm text-gray-400 font-medium italic">
            Không cho thuê
          </Text>
        </View>
      );
    },
    [mode]
  );

  const renderDress = ({ item }: { item: Dress }) => (
    <TouchableOpacity
      className="w-[48%] bg-white rounded-2xl mb-4 shadow-sm border border-gray-200 overflow-hidden"
      onPress={() => onDressPress(item)}
      activeOpacity={0.8}
    >
      <View className="relative h-48">
        <Image
          source={{
            uri:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://via.placeholder.com/200x300?text=Váy+cưới",
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <TouchableOpacity className="absolute top-2 right-2 w-8 h-8 bg-black/30 rounded-full items-center justify-center">
          <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        {item.status === "OUT_OF_STOCK" && (
          <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
            <Text className="text-white text-xs font-bold">Hết hàng</Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <Text
          className="text-sm font-bold text-gray-800 mb-2 leading-5"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-xs text-gray-600 ml-1 font-medium">
            {item.ratingAverage}
          </Text>
          <Text className="text-xs text-gray-400 ml-1">
            ({Math.floor(Math.random() * 100) + 20})
          </Text>
        </View>

        <View className="mb-3">{renderPrice(item)}</View>

        {/* Shop info short */}
        {item.user?.shop && (
          <View className="flex-row items-center">
            <Image
              source={{ uri: item.user.shop.logoUrl! }}
              className="w-5 h-5 rounded-full bg-gray-100 mr-2"
            />
            <View className="flex-1">
              <Text
                className="text-xs text-gray-600 font-medium"
                numberOfLines={1}
              >
                {item.user.shop.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={10} color="#F59E0B" />
                <Text className="text-xs text-gray-500 ml-1">
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
    <View className="px-4 pb-8 bg-white rounded-2xl mb-4 shadow-sm border border-gray-200">
      {/* Sub tabs Buy/Rent */}
      <View className="flex-row bg-gray-10 mt-4 rounded-xl p-1 gap-2 mb-4 border border-gray-200">
        {[
          { key: "buy", label: "Mua" },
          { key: "rent", label: "Thuê" },
        ].map((t) => {
          const active = mode === (t.key as Mode);
          return (
            <TouchableOpacity
              key={t.key}
              className={`flex-1 m-2 py-3 px-4 rounded-lg items-center justify-center transition-all ${
                active
                  ? "bg-primary-500 shadow-md transform scale-105"
                  : "bg-white hover:bg-gray-50"
              }`}
              onPress={() => setMode(t.key as Mode)}
              activeOpacity={0.8}
            >
              <Text
                className={`text-sm font-bold ${
                  active ? "text-white" : "text-gray-700"
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View className="flex-row justify-around mb-4 gap-3">
        <TouchableOpacity
          className="flex-row items-center bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl py-3 px-5 gap-2 border border-primary-500 "
          onPress={() => {
            if (onCustomRequestPress) {
              onCustomRequestPress();
            } else {
              console.log("Navigate to custom request create");
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="cut-outline" size={16} color="#E05C78" />
          <Text className="text-sm font-semibold text-primary-600">
            Đặt may
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl py-3 px-5 gap-2 border border-blue-500 "
          onPress={() => {
            if (onChatPress) {
              onChatPress();
            } else {
              console.log("Navigate to chat");
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#3B82F6" />
          <Text className="text-sm font-semibold text-blue-600">Tư vấn</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mb-4 gap-3">
        <View className="flex-1 flex-row bg-gray-100 rounded-2xl p-3 border border-gray-200">
          <Ionicons name="search" size={20} color="#6B7280" className="mr-3" />
          <TextInput
            style={{ fontSize: 14, color: "#374151" }}
            placeholder="Tìm kiếm váy cưới..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              className="p-1"
              onPress={() => setSearchQuery("")}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          className="flex-row items-center bg-primary-50 rounded-2xl p-3 border border-primary-100"
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="filter" size={20} color="#E05C78" />
          <Text className="text-sm font-semibold text-primary-600 ml-2">
            Bộ lọc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View className="items-center pt-4 border-t border-gray-200">
        <Text className="text-sm text-gray-600">
          {dresses.length} váy cưới
          {searchQuery && ` cho "${searchQuery}"`}
        </Text>
      </View>
    </View>
  );

  if (loading && dresses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="mt-4 text-base text-gray-600">
          Đang tải váy cưới...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={dresses}
        renderItem={renderDress}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          hasMore ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#E05C78" />
              <Text className="mt-2 text-sm text-gray-600">
                Đang tải thêm...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 justify-center items-center p-16">
              <Ionicons name="shirt-outline" size={64} color="#CCCCCC" />
              <Text className="mt-4 text-lg font-semibold text-gray-800">
                Không có váy cưới nào
              </Text>
              <Text className="mt-2 text-base text-gray-600 text-center">
                Hãy thử từ khóa khác
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
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800">Bộ lọc</Text>
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Sắp xếp theo
              </Text>
              <View className="flex-row justify-around bg-gray-100 rounded-xl p-1">
                <TouchableOpacity
                  className={`py-2 px-4 rounded-lg ${filterOptions.sort === "name:asc" ? "bg-primary-500 shadow-md" : ""}`}
                  onPress={() => handleSortChange("name:asc")}
                >
                  <Text
                    className={`text-sm font-semibold ${filterOptions.sort === "name:asc" ? "text-white" : "text-gray-700"}`}
                  >
                    Tên A-Z
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`py-2 px-4 rounded-lg ${filterOptions.sort === "name:desc" ? "bg-primary-500 shadow-md" : ""}`}
                  onPress={() => handleSortChange("name:desc")}
                >
                  <Text
                    className={`text-sm font-semibold ${filterOptions.sort === "name:desc" ? "text-white" : "text-gray-700"}`}
                  >
                    Tên Z-A
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Size Options */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Số lượng mỗi trang
              </Text>
              <View className="flex-row justify-around bg-gray-100 rounded-xl p-1">
                {[5, 10, 15, 20].map((size) => (
                  <TouchableOpacity
                    key={size}
                    className={`py-2 px-4 rounded-lg ${filterOptions.size === size ? "bg-primary-500 shadow-md" : ""}`}
                    onPress={() => handleSizeChange(size)}
                  >
                    <Text
                      className={`text-sm font-semibold ${filterOptions.size === size ? "text-white" : "text-gray-700"}`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              className="bg-primary-500 rounded-2xl py-3 px-10 items-center"
              onPress={() => setShowFilters(false)}
            >
              <Text className="text-lg font-bold text-white">Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
