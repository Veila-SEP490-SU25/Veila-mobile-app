import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AccessoryDetail } from "../services/apis/order.api";
import { Accessory } from "../services/types";
import { formatVNDCustom } from "../utils/currency.util";

type CheckoutAccessoriesProps = {
  shopAccessories: Accessory[];
  selectedAccessories: AccessoryDetail[];
  type: "SELL" | "RENT";
  onToggleAccessory: (accessoryId: string) => void;
  onUpdateAccessoryQuantity: (accessoryId: string, quantity: number) => void;
};

export default function CheckoutAccessories(props: CheckoutAccessoriesProps) {
  const {
    shopAccessories,
    selectedAccessories,
    type,
    onToggleAccessory,
    onUpdateAccessoryQuantity,
  } = props;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="bag" size={24} color="#8B5CF6" />
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
          Phụ kiện đi kèm
        </Text>
      </View>

      {shopAccessories.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <Ionicons name="bag-outline" size={32} color="#CCCCCC" />
          <Text style={{ color: "#6B7280", textAlign: "center", marginTop: 8 }}>
            Không có phụ kiện nào cho váy này
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {shopAccessories.map((accessory) => {
            const isSelected = selectedAccessories.some(
              (item) => item.accessoryId === accessory.id
            );
            const selectedItem = selectedAccessories.find(
              (item) => item.accessoryId === accessory.id
            );
            const quantity = selectedItem?.quantity || 0;

            return (
              <View
                key={accessory.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? "#E05C78" : "#E5E7EB",
                  backgroundColor: isSelected ? "#FDF2F8" : "#FFFFFF",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "500",
                        color: "#111827",
                        fontSize: 14,
                      }}
                    >
                      {accessory.name}
                    </Text>
                    <Text
                      style={{ color: "#6B7280", marginTop: 4, fontSize: 12 }}
                    >
                      {type === "SELL"
                        ? formatVNDCustom(accessory.sellPrice, "₫")
                        : formatVNDCustom(accessory.rentalPrice, "₫")}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => onToggleAccessory(accessory.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: isSelected ? "#E05C78" : "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "500",
                        fontSize: 12,
                        color: isSelected ? "#FFFFFF" : "#374151",
                      }}
                    >
                      {isSelected ? "Đã chọn" : "Chọn"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isSelected && (
                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>
                      Số lượng:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          onUpdateAccessoryQuantity(accessory.id, quantity - 1)
                        }
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#F3F4F6",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="remove" size={14} color="#666" />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: "#111827",
                          minWidth: 20,
                          textAlign: "center",
                        }}
                      >
                        {quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          onUpdateAccessoryQuantity(accessory.id, quantity + 1)
                        }
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#E05C78",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="add" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
