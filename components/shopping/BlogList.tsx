import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BlogPost {
  id: string;
  title: string;
  images: string[] | null;
  content?: string;
  publishedAt?: string;
  author?: string;
  summary?: string;
  tags?: string[];
  viewCount?: number;
  user: {
    shop: {
      name: string;
    };
  };
  category: {
    name: string;
  };
}

interface BlogListProps {
  blogs?: BlogPost[];
  onBlogPress: (blog: BlogPost) => void;
}

export default function BlogList({ blogs, onBlogPress }: BlogListProps) {

  const safeBlogs = blogs || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Gần đây";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Gần đây";
    }
  };

  const renderBlog = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => onBlogPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.images?.[0] || "https://via.placeholder.com/80x80?text=Blog",
        }}
        style={styles.blogImage}
        resizeMode="cover"
      />

      <View style={styles.blogInfo}>
        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {item.summary && (
          <Text style={styles.blogExcerpt} numberOfLines={2}>
            {item.summary}
          </Text>
        )}

        <View style={styles.blogMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color="#999999" />
            <Text style={styles.metaText}>{formatDate(item.publishedAt)}</Text>
          </View>

          {item.viewCount && (
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={12} color="#999999" />
              <Text style={styles.metaText}>
                {item.viewCount.toLocaleString()} lượt xem
              </Text>
            </View>
          )}
        </View>

        {/* Shop and Category Info */}
        <View style={styles.blogFooter}>
          {item.user?.shop?.name && (
            <View style={styles.shopInfo}>
              <Ionicons name="business-outline" size={12} color="#E05C78" />
              <Text style={styles.shopText} numberOfLines={1}>
                {item.user.shop.name}
              </Text>
            </View>
          )}

          {item.category?.name && (
            <View style={styles.categoryInfo}>
              <Ionicons name="pricetag-outline" size={12} color="#10B981" />
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.category.name}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  if (safeBlogs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>Không có bài viết nào</Text>
        <Text style={styles.emptySubtitle}>Hãy quay lại sau</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={safeBlogs}
        renderItem={renderBlog}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  blogCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  blogImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  blogInfo: {
    flex: 1,
    marginRight: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    lineHeight: 22,
  },
  blogExcerpt: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  blogMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#999999",
    marginLeft: 4,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999999",
  },
  blogFooter: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  shopText: {
    fontSize: 12,
    color: "#D97706",
    marginLeft: 4,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#065F46",
    marginLeft: 4,
  },
});
