import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
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

  const { data, isLoading, isFetching, refetch } = useGetBlogsQuery({
    page,
    size: 10,
    sort: "title:asc",
  });

  useEffect(() => {
    if (data) {
      if (page === 0) {
        setBlogs(data.items);
      } else {
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

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    refetch();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (data?.hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  const renderBlog = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      className="mb-5 bg-white rounded-2xl shadow-card overflow-hidden"
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
          className="font-bold text-lg text-primary-600 mb-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {item.summary ? (
          <Text className="text-gray-500 text-base mb-2" numberOfLines={3}>
            {item.summary}
          </Text>
        ) : null}
        <View className="flex-row items-center mt-1">
          <Ionicons name="document-text-outline" size={16} color="#E05C78" />
          <Text className="ml-2 text-xs text-gray-400">Blog</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={
        data?.hasNextPage ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#E05C78" />
            <Text className="mt-2 text-sm text-gray-400">Đang tải thêm...</Text>
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
              Hãy quay lại sau để xem bài viết mới
            </Text>
          </View>
        ) : null
      }
    />
  );
}
