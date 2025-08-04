import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const categories: Category[] = [
  {
    id: "explore",
    title: "Khám phá Váy Cưới",
    subtitle: "Bộ sưu tập đa dạng",
    icon: "sparkles",
    color: "#E05C78",
    onPress: () => console.log("Explore pressed"),
  },
  // {
  //   id: "consultation",
  //   title: "Tư vấn cá nhân",
  //   subtitle: "Chuyên gia tư vấn",
  //   icon: "person-circle",
  //   color: "#8B5CF6",
  //   onPress: () => console.log("Consultation pressed"),
  // },
  {
    id: "stores",
    title: "Cửa hàng",
    subtitle: "Showroom gần bạn",
    icon: "storefront",
    color: "#06B6D4",
    onPress: () => console.log("Stores pressed"),
  },
  {
    id: "custom",
    title: "Đặt may",
    subtitle: "Thiết kế riêng",
    icon: "cut",
    color: "#10B981",
    onPress: () => console.log("Custom pressed"),
  },
  {
    id: "rent",
    title: "Thuê váy",
    subtitle: "Tiết kiệm chi phí",
    icon: "shirt",
    color: "#F59E0B",
    onPress: () => console.log("Rent pressed"),
  },
  // {
  //   id: "resale",
  //   title: "Mua bán lại",
  //   subtitle: "Váy đã qua sử dụng",
  //   icon: "repeat",
  //   color: "#EF4444",
  //   onPress: () => console.log("Resale pressed"),
  // },
  {
    id: "blog",
    title: "Blog & Stories",
    subtitle: "Chia sẻ kinh nghiệm",
    icon: "book",
    color: "#6366F1",
    onPress: () => console.log("Blog pressed"),
  },
  {
    id: "chat",
    title: "Chat",
    subtitle: "Hỗ trợ trực tuyến",
    icon: "chatbubbles",
    color: "#8B5CF6",
    onPress: () => console.log("Chat pressed"),
  },
];

export default function CategoryGrid() {
  const renderCategory = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={category.onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${category.color}15` },
        ]}
      >
        <Ionicons name={category.icon} size={24} color={category.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
      <View style={styles.gridContainer}>{categories.map(renderCategory)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 13,
    color: "#666666",
  },
});
