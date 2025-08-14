import { Ionicons } from "@expo/vector-icons";
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
import { Accessory } from "../../services/types";

interface AccessoryGridProps {
  accessories: Accessory[];
  onAccessoryPress: (accessory: Accessory) => void;
}

export default function AccessoryGrid({
  accessories,
  onAccessoryPress,
}: AccessoryGridProps) {
  const handleAccessoryPress = (accessory: Accessory) => {
    // Navigate to accessory detail page
    router.push(`/accessory/${accessory.id}` as any);
    // Also call the callback if provided
    onAccessoryPress(accessory);
  };

  const renderAccessory = ({ item }: { item: Accessory }) => (
    <TouchableOpacity
      style={styles.accessoryCard}
      onPress={() => handleAccessoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.images?.[0] ||
              "https://via.placeholder.com/120x120?text=Phụ+kiện",
          }}
          style={styles.accessoryImage}
          resizeMode="cover"
        />
        {item.status === "AVAILABLE" && (
          <View style={styles.availableBadge}>
            <Text style={styles.availableText}>Có sẵn</Text>
          </View>
        )}
        {item.status === "UNAVAILABLE" && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Hết hàng</Text>
          </View>
        )}
      </View>

      <View style={styles.accessoryInfo}>
        <Text style={styles.accessoryName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.ratingAverage}</Text>
        </View>

        <View style={styles.pricingContainer}>
          {item.isSellable && (
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Mua:</Text>
              <Text style={styles.priceValue}>{item.sellPrice}đ</Text>
            </View>
          )}
          {item.isRentable && (
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Thuê:</Text>
              <Text style={styles.rentalValue}>{item.rentalPrice}đ</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleAccessoryPress(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={14} color="#E05C78" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={accessories}
      renderItem={renderAccessory}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
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
  row: {
    justifyContent: "space-between",
  },
  accessoryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  accessoryImage: {
    width: "100%",
    height: "100%",
  },
  availableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  unavailableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  accessoryInfo: {
    padding: 12,
  },
  accessoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
    fontWeight: "500",
  },
  pricingContainer: {
    marginBottom: 12,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: "#666666",
  },
  priceValue: {
    fontSize: 12,
    color: "#E05C78",
    fontWeight: "700",
  },
  rentalValue: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "700",
  },
  actionContainer: {
    alignItems: "center",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  viewButtonText: {
    fontSize: 11,
    color: "#E05C78",
    fontWeight: "600",
    marginRight: 4,
  },
});
