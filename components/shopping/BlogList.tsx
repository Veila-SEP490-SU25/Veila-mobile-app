import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetBlogsQuery } from "../../services/apis/blog.api";
import { BlogPost } from "../../services/types";

interface BlogListProps {
  onBlogPress: (blog: BlogPost) => void;
}

export default function BlogList({ onBlogPress }: BlogListProps) {
  const [page, setPage] = useState(0);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title:asc");

  // Gọi API với page, size = 10, sort, filter
  const { data, isLoading, isFetching, refetch, error } = useGetBlogsQuery({
    page,
    size: 10, // mỗi page 10 bài
    sort: sortBy,
    filter: debouncedSearchQuery
      ? `title:like:${debouncedSearchQuery}`
      : undefined,
  });

  // Debounce nhập tìm kiếm 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(0); // reset page khi thay đổi từ khóa tìm kiếm
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Khi sortBy thay đổi, reset page về 0 luôn
  useEffect(() => {
    setPage(0);
  }, [sortBy]);

  // Khi data thay đổi, update danh sách blogs
  useEffect(() => {
    if (data?.items) {
      if (page === 0) {
        setBlogs(data.items); // trang đầu thì reset list
      } else {
        // Trang tiếp theo thì gộp list tránh trùng
        setBlogs((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const newItems = data.items.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  // Refresh lại danh sách
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0); // reset về trang đầu
    refetch().finally(() => setRefreshing(false)); // tắt refreshing sau khi load xong
  }, [refetch]);

  // Load thêm trang kế tiếp khi scroll đến cuối
  const loadMore = useCallback(() => {
    if (data?.hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasNextPage, isFetching]);

  // Các hàm xử lý sự kiện
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSort = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  const handleShopPress = useCallback((shopId: string) => {
    router.push(`/shop/${shopId}`);
  }, []);

  // Render từng blog item
  const renderBlog = useCallback(
    ({ item }: { item: BlogPost }) => (
      <TouchableOpacity
        className="mb-20 bg-white mx-5 rounded-2xl shadow-card overflow-hidden"
        onPress={() => onBlogPress(item)}
        activeOpacity={0.85}
      >
        <View className="w-full aspect-[2/1] bg-gray-100">
          <Image
            source={{
              uri:
                item.images && item.images.length > 0
                  ? item.images[0]
                  : "https://placehold.co/600x300?text=Blog",
            }}
            className="w-full h-full rounded-t-2xl"
            resizeMode="cover"
          />
        </View>
        <View className="p-4">
          <Text
            className="font-bold text-lg text-primary-600 mb-2"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {/* Shop Info */}
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() => handleShopPress(item.user.shop.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.user.shop.logoUrl }}
              className="w-8 h-8 rounded-full mr-3"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700">
                {item.user.shop.name}
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {item.user.shop.address}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-primary-600 ml-1">
                Điểm uy tín:
              </Text>
              <Text className="text-xs text-gray-600 ml-1">
                {item.user.shop.reputation}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Category */}
          {/* <View className="flex-row items-center mb-2">
            <View className="bg-primary-100 px-3 py-1 rounded-full">
              <Text className="text-xs text-primary-600 font-semibold">
                {item.category.name}
              </Text>
            </View>
          </View> */}

          {/* Summary */}
          {item.summary ? (
            <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
              {item.summary}
            </Text>
          ) : null}

          {/* Meta Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#E05C78"
              />
              <Text className="ml-2 text-xs text-gray-400">
                {item.category.name}
              </Text>
            </View>
            {item.publishedAt && (
              <Text className="text-xs text-gray-400">
                {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [onBlogPress, handleShopPress]
  );

  // Header gồm thanh tìm kiếm và chọn sort
  const renderHeader = useCallback(
    () => (
      <View className="px-5 pb-5 bg-white rounded-b-xl">
        {/* Search Bar */}
        <View className="mb-5">
          <View className="flex-row items-center bg-gray-200 mt-4 rounded-full px-5 py-3 shadow-sm">
            <Ionicons name="search" size={22} color="#888" />
            <TextInput
              className="flex-1 ml-4 text-base text-gray-800 font-medium"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#aaa"
              selectionColor="#E05C78"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch("")}
                className="p-1 rounded-full active:opacity-70"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={22} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          {searchQuery !== debouncedSearchQuery && (
            <View className="flex-row items-center mt-3">
              <ActivityIndicator size="small" color="#E05C78" />
              <Text className="ml-3 text-sm text-gray-500 italic">
                Đang tìm kiếm...
              </Text>
            </View>
          )}
        </View>

        {/* Sort Options */}
        <View className="flex-row justify-start space-x-3">
          {[
            { label: "A-Z", value: "title:asc" },
            { label: "Z-A", value: "title:desc" },
            { label: "Mới nhất", value: "publishedAt:desc" },
          ].map(({ label, value }) => {
            const isActive = sortBy === value;
            return (
              <TouchableOpacity
                key={value}
                className={`px-5 py-2 rounded-full border transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-600 border-primary-600"
                    : "bg-white border-gray-300"
                }`}
                onPress={() => handleSort(value)}
                activeOpacity={0.75}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ),
    [searchQuery, debouncedSearchQuery, sortBy, handleSearch, handleSort]
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-10 px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-700 mt-6 mb-2">
          Có lỗi xảy ra
        </Text>
        <Text className="text-base text-gray-500 text-center mb-4">
          Không thể tải danh sách bài viết. Vui lòng thử lại.
        </Text>
        <TouchableOpacity
          className="bg-primary-500 px-6 py-3 rounded-xl"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && blogs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="mt-4 text-base text-gray-500">
          Đang tải bài viết...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={blogs}
      renderItem={renderBlog}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={
        data?.hasNextPage ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#E05C78" />
            <Text className="mt-2 text-sm text-gray-400">Đang tải thêm...</Text>
          </View>
        ) : blogs.length > 0 ? (
          <View className="py-4 items-center">
            <Text className="text-sm text-gray-400">
              Hiển thị {blogs.length} / {data?.totalItems || 0} bài viết
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
            <Text className="text-xl font-bold text-gray-400 mt-6 mb-2">
              Không có bài viết nào
            </Text>
            <Text className="text-base text-gray-400 text-center">
              {debouncedSearchQuery
                ? "Không tìm thấy bài viết phù hợp với từ khóa tìm kiếm"
                : "Hãy quay lại sau để xem bài viết mới"}
            </Text>
          </View>
        ) : null
      }
    />
  );
}
