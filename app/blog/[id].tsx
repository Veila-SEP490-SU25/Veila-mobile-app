import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetBlogByIdQuery } from "../../services/apis/blog.api";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ShopInfo = React.memo(
  ({ shop, onPress }: { shop: any; onPress: () => void }) => {
    if (!shop) return null;
    return (
      <TouchableOpacity
        className="flex-row items-center mt-12 mb-6 p-5 bg-primary-50 rounded-3xl shadow-sm border border-primary-200"
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: shop.logoUrl || "https://placehold.co/48x48" }}
          className="w-14 h-14 rounded-full mr-5 border border-primary-300"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-lg font-extrabold text-primary-700 mb-1">
            {shop.name || "Tên shop"}
          </Text>
          <Text className="text-sm text-primary-500 mb-1" numberOfLines={2}>
            {shop.address || "Địa chỉ shop chưa cập nhật"}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-sm text-primary-600  font-semibold">
              Điểm uy tín:
            </Text>
            <Text className="text-sm text-primary-600 font-semibold">
              {shop.reputation ?? "Chưa có đánh giá"}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999999" />
      </TouchableOpacity>
    );
  }
);

const MetaInfo = React.memo(({ blog }: { blog: any }) => (
  <View className="flex-row flex-wrap items-center mb-6 p-4 bg-gray-100 rounded-xl">
    {blog.publishedAt && (
      <View className="flex-row items-center mr-6 mb-2">
        <Ionicons name="calendar-outline" size={18} color="#777777" />
        <Text className="ml-2 text-sm text-gray-600 font-medium">
          {formatDate(blog.publishedAt)}
        </Text>
      </View>
    )}
    {blog.viewCount && (
      <View className="flex-row items-center mr-6 mb-2">
        <Ionicons name="eye-outline" size={18} color="#777777" />
        <Text className="ml-2 text-sm text-gray-600 font-medium">
          {blog.viewCount.toLocaleString()} lượt xem
        </Text>
      </View>
    )}
    {blog.author && (
      <View className="flex-row items-center mb-2">
        <Ionicons name="person-outline" size={18} color="#777777" />
        <Text className="ml-2 text-sm text-gray-600 font-medium">
          {blog.author}
        </Text>
      </View>
    )}
  </View>
));

const Tags = React.memo(({ tags }: { tags?: string[] }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <View className="flex-row flex-wrap mb-6">
      {tags.map((tag, idx) => (
        <View
          key={idx}
          className="bg-primary-200 px-4 py-1 rounded-full mr-3 mb-3"
        >
          <Text className="text-xs text-primary-800 font-semibold">#{tag}</Text>
        </View>
      ))}
    </View>
  );
});

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: blog, isLoading } = useGetBlogByIdQuery(id ?? "", {
    skip: !id,
  });

  const handleShopPress = useCallback(() => {
    if (blog?.user?.shop?.id) {
      router.push(`/shop/${blog.user.shop.id}`);
    }
  }, [blog]);

  if (!id || typeof id !== "string") {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <Text className="text-lg text-red-500 font-semibold">
          ID bài viết không hợp lệ
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="mt-5 text-base text-primary-500 font-medium">
          Đang tải bài viết, xin bạn vui lòng chờ...
        </Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <Text className="text-lg text-gray-400 font-semibold">
          Rất tiếc, không tìm thấy bài viết bạn đang tìm.
        </Text>
        <Text className="mt-2 text-gray-400 text-center px-10">
          Có thể bài viết đã bị xóa hoặc chưa được đăng tải. Vui lòng thử lại
          sau.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-20 pb-4 bg-white shadow-sm z-10">
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-primary-100 justify-center items-center shadow-md"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#E05C78" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-extrabold text-primary-700 ml-3">
          Chi tiết bài viết
        </Text>
        <View className="w-11" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="w-full aspect-[2/1] bg-gray-200 rounded-b-4xl overflow-hidden shadow-sm">
          <Image
            source={{
              uri:
                blog.images?.[0] ??
                "https://placehold.co/600x300?text=Blog+Image",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="px-6 pt-7 pb-12">
          {/* Title */}
          <Text className="text-3xl font-extrabold text-primary-700 mb-5">
            {blog.title}
          </Text>

          {/* Summary */}
          {blog.summary && (
            <View className="mb-6 p-5 bg-primary-100 rounded-2xl border border-primary-200 shadow-inner">
              <Text className="text-lg text-primary-800 font-semibold italic">
                {blog.summary}
              </Text>
            </View>
          )}

          {/* Content */}
          {blog.content ? (
            <View className="mt-6">
              <Text className="text-base text-gray-700 leading-relaxed tracking-wide">
                {blog.content}
              </Text>
            </View>
          ) : (
            <View className="mt-8 p-8 bg-gray-100 rounded-xl items-center shadow-md">
              <Ionicons
                name="document-text-outline"
                size={52}
                color="#BBBBBB"
              />
              <Text className="text-xl font-semibold text-gray-500 mt-5 mb-3">
                Nội dung đang được cập nhật
              </Text>
              <Text className="text-base text-gray-400 text-center px-8">
                Bài viết này chưa có nội dung chi tiết. Hãy quay lại sau để cập
                nhật thông tin mới nhất nhé!
              </Text>
            </View>
          )}

          {/* Shop Information */}
          <ShopInfo shop={blog.user?.shop} onPress={handleShopPress} />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#E05C78"
              />
              <Text className="ml-2 text-xs text-gray-400">
                {blog.category.name}
              </Text>
            </View>
            {blog.publishedAt && (
              <Text className="text-xs text-gray-400">
                {new Date(blog.publishedAt).toLocaleDateString("vi-VN")}
              </Text>
            )}
          </View>

          {/* Meta Information */}
          <MetaInfo blog={blog} />

          {/* Tags */}
          <Tags tags={blog.tags} />
        </View>
      </ScrollView>
    </View>
  );
}
