import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetBlogByIdQuery } from "../../services/apis/blog.api";

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: blog, isLoading } = useGetBlogByIdQuery(id as string, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="mt-4 text-base text-gray-500">
          Đang tải bài viết...
        </Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 justify-center items-center py-10 bg-white">
        <Text className="text-lg text-gray-500">Không tìm thấy bài viết</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white shadow-sm z-10">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-primary-100 justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-primary-600 ml-2">
          Chi tiết blog
        </Text>
        <View className="w-10" />
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="w-full aspect-[2/1] bg-gray-100 rounded-b-3xl overflow-hidden">
          <Image
            source={{
              uri: blog.images?.[0] || "https://placehold.co/600x300?text=Blog",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="px-5 pt-6 pb-10">
          <Text className="text-2xl font-bold text-primary-600 mb-2">
            {blog.title}
          </Text>
          {/* Meta */}
          <View className="flex-row flex-wrap items-center mb-3">
            <Ionicons name="person-outline" size={16} color="#666666" />
            <Text className="ml-1 text-xs text-gray-500 mr-4">
              {blog.author}
            </Text>
            {blog.publishedAt && (
              <>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#666666"
                  style={{ marginLeft: 8 }}
                />
                <Text className="ml-1 text-xs text-gray-500 mr-4">
                  {formatDate(blog.publishedAt)}
                </Text>
              </>
            )}
            {blog.viewCount && (
              <>
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color="#666666"
                  style={{ marginLeft: 8 }}
                />
                <Text className="ml-1 text-xs text-gray-500 mr-4">
                  {blog.viewCount}
                </Text>
              </>
            )}
          </View>
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {blog.tags.map((tag, idx) => (
                <View
                  key={idx}
                  className="bg-primary-100 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-xs text-primary-600 font-semibold">
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {/* Summary */}
          {blog.summary && (
            <Text className="text-base text-primary-500 font-semibold mb-3">
              {blog.summary}
            </Text>
          )}
          {/* Content */}
          <Text className="text-base text-gray-700 leading-7">
            {blog.content}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
