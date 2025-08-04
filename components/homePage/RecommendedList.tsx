import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Dress {
  id: string;
  name: string;
  image: string;
  theme: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
}

const recommendedDresses: Dress[] = [
  {
    id: "1",
    name: "Váy công chúa ren tay dài",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    theme: "Cổ điển",
    price: "2,500,000đ",
    originalPrice: "3,200,000đ",
    rating: 4.8,
    reviewCount: 124,
    isSale: true,
  },
  {
    id: "2",
    name: "Váy cưới đuôi cá satin",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    theme: "Hiện đại",
    price: "3,800,000đ",
    rating: 4.9,
    reviewCount: 89,
    isNew: true,
  },
  {
    id: "3",
    name: "Váy cưới bohemian vintage",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    theme: "Boho",
    price: "2,200,000đ",
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: "4",
    name: "Váy cưới minimalist",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    theme: "Tối giản",
    price: "1,800,000đ",
    originalPrice: "2,500,000đ",
    rating: 4.6,
    reviewCount: 78,
    isSale: true,
  },
];

export default function RecommendedList() {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={12}
          color={i <= rating ? "#F59E0B" : "#D1D5DB"}
        />
      );
    }
    return stars;
  };

  const renderDress = (dress: Dress) => (
    <Pressable
      key={dress.id}
      style={styles.dressCard}
      onPress={() => console.log("Dress pressed:", dress.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: dress.image }}
          style={styles.dressImage}
          resizeMode="cover"
        />
        {dress.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {dress.isSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>SALE</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.dressInfo}>
        <Text style={styles.dressName} numberOfLines={2}>
          {dress.name}
        </Text>
        <Text style={styles.dressTheme}>{dress.theme}</Text>

        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>{renderStars(dress.rating)}</View>
          <Text style={styles.reviewCount}>({dress.reviewCount})</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{dress.price}</Text>
          {dress.originalPrice && (
            <Text style={styles.originalPrice}>{dress.originalPrice}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Váy nổi bật dành riêng cho bạn</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color="#E05C78" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {recommendedDresses.map(renderDress)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFfFf",

    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#E05C78",
    fontWeight: "500",
    marginRight: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  dressCard: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: "relative",
    height: 240,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  dressImage: {
    width: "100%",
    height: "100%",
  },
  newBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  saleBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saleBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dressInfo: {
    padding: 12,
  },
  dressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
    lineHeight: 18,
  },
  dressTheme: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 11,
    color: "#999999",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E05C78",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: "#999999",
    textDecorationLine: "line-through",
  },
});
