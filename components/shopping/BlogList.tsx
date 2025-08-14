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

interface Blog {
  id: string;
  title: string;
  images: string[] | null;
  content?: string;
  createdAt?: string;
}

interface BlogListProps {
  blogs: Blog[];
  onBlogPress: (blog: Blog) => void;
}

export default function BlogList({ blogs, onBlogPress }: BlogListProps) {
  const renderBlog = ({ item }: { item: Blog }) => (
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

        {item.content && (
          <Text style={styles.blogExcerpt} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        <View style={styles.blogMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color="#999999" />
            <Text style={styles.metaText}>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                : "Gần đây"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={12} color="#999999" />
            <Text style={styles.metaText}>123 lượt xem</Text>
          </View>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={blogs}
      renderItem={renderBlog}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      scrollEnabled={false} // Disable scroll since it's inside another FlatList
    />
  );
}

const styles = StyleSheet.create({
  container: {
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
});
