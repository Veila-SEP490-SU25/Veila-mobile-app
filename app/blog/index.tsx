import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BlogList from "../../components/shopping/BlogList";
import { useGetBlogsQuery } from "../../services/apis/blog.api";

export default function BlogScreen() {
  const {
    data: blogsResponse,
    isLoading,
    error,
    refetch,
  } = useGetBlogsQuery({
    page: 0,
    size: 20,
  });

  const handleBlogPress = (blog: any) => {
    router.push(`/blog/${blog.id}` as any);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#E05C78" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tất cả bài viết</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E05C78" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#E05C78" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tất cả bài viết</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Không thể tải bài viết</Text>
          <Text style={styles.errorMessage}>
            Đã xảy ra lỗi khi tải danh sách bài viết. Vui lòng thử lại.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const blogs = blogsResponse?.items || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tất cả bài viết</Text>
        <View style={{ width: 40 }} />
      </View>

      {blogs.length > 0 ? (
        <BlogList blogs={blogs} onBlogPress={handleBlogPress} />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="newspaper-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
          <Text style={styles.emptyMessage}>
            Hiện tại chưa có bài viết nào được đăng tải. Hãy quay lại sau!
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 70,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E05C78",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#E05C78",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#CCCCCC",
    marginTop: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: "#E05C78",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
