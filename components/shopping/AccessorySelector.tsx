import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatVNDCustom } from "../../utils/currency.util";

interface Accessory {
  id: string;
  name: string;
  images: string[] | null; // Fix: should be string[] | null, not string
  sellPrice: string;
  rentalPrice: string;
  isSellable: boolean;
  isRentable: boolean;
  status: string;
  user: {
    shop: {
      id: string;
      name: string;
      address: string;
      logoUrl: string;
      reputation: number;
    };
  };
  category: {
    id: string;
    name: string;
    type: string;
  };
}

interface SelectedAccessory {
  accessory: Accessory;
  quantity: number;
  isSelected: boolean;
}

interface AccessorySelectorProps {
  accessories: Accessory[];
  mode: "buy" | "rent";
  onSelectionChange: (selectedAccessories: SelectedAccessory[]) => void;
}

export default function AccessorySelector({
  accessories,
  mode,
  onSelectionChange,
}: AccessorySelectorProps) {
  console.log("🔍 AccessorySelector render:", {
    accessoriesCount: accessories.length,
    accessories: accessories,
    mode: mode,
  });

  const [selectedAccessories, setSelectedAccessories] = useState<
    SelectedAccessory[]
  >(
    accessories.map((accessory) => ({
      accessory,
      quantity: 1,
      isSelected: false,
    }))
  );

  const handleToggleSelection = (accessoryId: string) => {
    setSelectedAccessories((prev) =>
      prev.map((item) =>
        item.accessory.id === accessoryId
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const handleQuantityChange = (accessoryId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setSelectedAccessories((prev) =>
      prev.map((item) =>
        item.accessory.id === accessoryId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getPrice = (accessory: Accessory) => {
    if (mode === "buy") {
      return accessory.isSellable ? accessory.sellPrice : "0";
    } else {
      return accessory.isRentable ? accessory.rentalPrice : "0";
    }
  };

  const getTotalPrice = () => {
    return selectedAccessories
      .filter((item) => item.isSelected)
      .reduce((total, item) => {
        const price = parseFloat(getPrice(item.accessory));
        return total + price * item.quantity;
      }, 0);
  };

  const getSelectedCount = () => {
    return selectedAccessories.filter((item) => item.isSelected).length;
  };

  const getSelectedItems = () => {
    return selectedAccessories.filter((item) => item.isSelected);
  };

  // Notify parent component when selection changes
  React.useEffect(() => {
    const selectedItems = selectedAccessories.filter((item) => item.isSelected);
    onSelectionChange(selectedItems);
  }, [selectedAccessories, onSelectionChange]);

  const renderAccessory = ({ item }: { item: SelectedAccessory }) => {
    const { accessory, quantity, isSelected } = item;
    const price = getPrice(accessory);
    const isAvailable =
      mode === "buy" ? accessory.isSellable : accessory.isRentable;

    if (!isAvailable) {
      return (
        <View style={[styles.accessoryCard, styles.unavailableCard]}>
          <Image
            source={{ uri: accessory.images?.[0] }}
            style={styles.accessoryImage}
            resizeMode="cover"
          />
          <View style={styles.accessoryInfo}>
            <Text style={styles.accessoryName} numberOfLines={2}>
              {accessory.name}
            </Text>
            <Text style={styles.unavailableText}>
              Không {mode === "buy" ? "bán" : "cho thuê"}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.accessoryCard, isSelected && styles.selectedCard]}
        onPress={() => handleToggleSelection(accessory.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{
            uri:
              Array.isArray(item.accessory.images) &&
              item.accessory.images.length > 0
                ? item.accessory.images[0]
                : "https://via.placeholder.com/80x80?text=Phụ+kiện",
          }}
          style={styles.accessoryImage}
          resizeMode="cover"
        />

        <View style={styles.accessoryInfo}>
          <Text style={styles.accessoryName} numberOfLines={2}>
            {accessory.name}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>
              {mode === "buy" ? "Giá bán:" : "Giá thuê:"}
            </Text>
            <Text style={styles.priceValue}>{formatVNDCustom(price, "₫")}</Text>
          </View>

          <View style={styles.shopInfo}>
            <Image
              source={{ uri: accessory.user.shop.logoUrl }}
              style={styles.shopLogo}
            />
            <Text style={styles.shopName} numberOfLines={1}>
              {accessory.user.shop.name}
            </Text>
          </View>
        </View>

        <View style={styles.selectionContainer}>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          )}

          {isSelected && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(accessory.id, quantity - 1)}
              >
                <Ionicons name="remove" size={16} color="#E05C78" />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(accessory.id, quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#E05C78" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with selection info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phụ kiện đi kèm</Text>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Đã chọn: {getSelectedCount()}/{accessories.length}
          </Text>
          <Text style={styles.totalPrice}>
            Tổng: {formatVNDCustom(getTotalPrice().toString(), "₫")}
          </Text>
        </View>
      </View>

      {/* Accessories list */}
      <FlatList
        data={selectedAccessories}
        renderItem={renderAccessory}
        keyExtractor={(item) => item.accessory.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>
              Không có phụ kiện nào cho váy này
            </Text>
            <Text style={styles.emptySubtitle}>
              Shop này chưa cung cấp phụ kiện
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  selectionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectionText: {
    fontSize: 14,
    color: "#666666",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E05C78",
  },
  listContainer: {
    padding: 16,
  },
  accessoryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#E05C78",
    backgroundColor: "#FFF5F6",
  },
  unavailableCard: {
    opacity: 0.6,
    backgroundColor: "#F3F4F6",
  },
  accessoryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  accessoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  accessoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E05C78",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  shopName: {
    fontSize: 12,
    color: "#999999",
    flex: 1,
  },
  selectionContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E05C78",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  unavailableText: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
