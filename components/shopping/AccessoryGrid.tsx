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
import { Accessory } from "../../services/types";

interface AccessoryGridProps {
  accessories: Accessory[];
  mode?: "buy" | "rent";
  onAccessorySelect?: (accessory: Accessory) => void;
  isSelector?: boolean;
}

export default function AccessoryGrid({
  accessories,
  mode = "buy",
  onAccessorySelect,
}: AccessoryGridProps) {
  const renderAccessory = ({ item }: { item: Accessory }) => (
    <TouchableOpacity
      style={styles.accessoryCard}
      onPress={() => onAccessorySelect?.(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://via.placeholder.com/120x120?text=Phụ+kiện",
        }}
        style={styles.accessoryImage}
        resizeMode="cover"
      />

      <View style={styles.accessoryInfo}>
        <Text style={styles.accessoryName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceContainer}>
          {mode === "buy" && item.isSellable && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá bán:</Text>
              <Text style={styles.priceValue}>
                {item.sellPrice ? `${item.sellPrice} ₫` : "Liên hệ"}
              </Text>
            </View>
          )}

          {mode === "rent" && item.isRentable && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá thuê:</Text>
              <Text style={styles.rentalValue}>
                {item.rentalPrice ? `${item.rentalPrice} ₫` : "Liên hệ"}
              </Text>
            </View>
          )}
        </View>

        {/* Shop info - Remove since user field doesn't exist in Accessory type */}
        {/* Status badge */}
        {item.status === "AVAILABLE" ? (
          <View style={styles.availableBadge}>
            <Text style={styles.availableText}>Có sẵn</Text>
          </View>
        ) : (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Hết hàng</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (accessories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="diamond-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>Không có phụ kiện nào</Text>
        <Text style={styles.emptySubtitle}>Hãy quay lại sau</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={accessories}
        renderItem={renderAccessory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.accessoryRow}
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
    paddingHorizontal: 4,
  },
  accessoryRow: {
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
  accessoryImage: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  shopName: {
    fontSize: 12,
    color: "#999999",
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
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
  shopLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  availableBadge: {
    backgroundColor: "#E0F2F7",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  availableText: {
    color: "#06B6D4",
    fontSize: 10,
    fontWeight: "600",
  },
  unavailableBadge: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  unavailableText: {
    color: "#991B1B",
    fontSize: 10,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
});
