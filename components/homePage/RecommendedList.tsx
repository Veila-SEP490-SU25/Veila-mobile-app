import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatVNDCustom } from "../../utils/currency.util";

interface Dress {
  id: string;
  name: string;
  images: string[];
  price: string;
  originalPrice?: string;
}

const mockDresses: Dress[] = [
  {
    id: "1",
    name: "Váy cưới dáng A lãng mạn",
    images: ["https://via.placeholder.com/300x400?text=Váy+1"],
    price: "2,500,000",
    originalPrice: "3,200,000",
  },
  {
    id: "2",
    name: "Váy cưới dáng mermaid sang trọng",
    images: ["https://via.placeholder.com/300x400?text=Váy+2"],
    price: "3,800,000",
  },
  {
    id: "3",
    name: "Váy cưới dáng ballgown cổ điển",
    images: ["https://via.placeholder.com/300x400?text=Váy+3"],
    price: "2,200,000",
    originalPrice: "2,500,000",
  },
  {
    id: "4",
    name: "Váy cưới dáng sheath hiện đại",
    images: ["https://via.placeholder.com/300x400?text=Váy+4"],
    price: "1,800,000",
    originalPrice: "2,500,000",
  },
];

export default function RecommendedList() {
  const handleDressPress = (dress: Dress) => {
    router.push(`/dress/${dress.id}` as any);
  };

  const renderDress = ({ item }: { item: Dress }) => (
    <TouchableOpacity
      style={styles.dressCard}
      onPress={() => handleDressPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.images[0] }} style={styles.dressImage} />

      <View style={styles.dressInfo}>
        <Text style={styles.dressName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatVNDCustom(parseInt(item.price), "₫")}
          </Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatVNDCustom(parseInt(item.originalPrice), "₫")}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đề xuất cho bạn</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockDresses}
        renderItem={renderDress}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
  seeAll: {
    fontSize: 14,
    color: "#E05C78",
    fontWeight: "500",
  },
  listContainer: {
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
  dressImage: {
    width: "100%",
    height: 240,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
