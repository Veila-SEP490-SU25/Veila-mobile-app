import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AccessoryDetail } from "../services/apis/order.api";
import { Accessory } from "../services/types";
import { formatVNDCustom } from "../utils/currency.util";

type CheckoutAccessoriesProps = {
  shopAccessories: Accessory[];
  selectedAccessories: AccessoryDetail[];
  type: "SELL" | "RENT";
  dress?: any; // Thêm dress prop để lấy giá
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

  // State để lưu validation errors cho từng phụ kiện
  const [quantityErrors, setQuantityErrors] = useState<{
    [key: string]: string;
  }>({});

  // Validation function cho số lượng
  const validateQuantity = (
    accessoryId: string,
    quantity: number
  ): string | null => {
    if (quantity <= 0) {
      return "Số lượng phải lớn hơn 0";
    }

    // Giới hạn số lượng hợp lý cho mỗi loại phụ kiện
    // TODO: Cần cập nhật type Accessory để có property quantity/stock
    const maxQuantity = 5; // Giới hạn tạm thời, có thể điều chỉnh sau
    if (quantity > maxQuantity) {
      return `Số lượng không được vượt quá ${maxQuantity} cái`;
    }

    return null;
  };

  // Function để update số lượng với validation
  const handleUpdateQuantity = (accessoryId: string, newQuantity: number) => {
    // Clear error trước
    setQuantityErrors((prev) => ({ ...prev, [accessoryId]: "" }));

    // Validate số lượng mới
    const error = validateQuantity(accessoryId, newQuantity);
    if (error) {
      setQuantityErrors((prev) => ({ ...prev, [accessoryId]: error }));
      return;
    }

    // Nếu validation pass, update số lượng
    onUpdateAccessoryQuantity(accessoryId, newQuantity);
  };

  // Function để toggle phụ kiện với validation
  const handleToggleAccessory = (accessoryId: string) => {
    const isSelected = selectedAccessories.some(
      (item) => item.accessoryId === accessoryId
    );

    if (isSelected) {
      // Nếu đang chọn, bỏ chọn và clear error
      setQuantityErrors((prev) => ({ ...prev, [accessoryId]: "" }));
      onToggleAccessory(accessoryId);
    } else {
      // Nếu chưa chọn, chọn với số lượng mặc định là 1
      onToggleAccessory(accessoryId);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="bag" size={24} color="#8B5CF6" />
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
          Phụ kiện đi kèm
        </Text>
      </View>

      <Text style={{ color: "#6B7280", fontSize: 14, lineHeight: 20 }}>
        Chọn phụ kiện bổ sung cho váy của bạn. Bạn có thể điều chỉnh số lượng
        cho từng phụ kiện.
      </Text>

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
            const quantityError = quantityErrors[accessory.id];

            return (
              <View
                key={accessory.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? "#E05C78" : "#E5E7EB",
                  backgroundColor: isSelected ? "#FDF2F8" : "#FFFFFF",
                  shadowColor: isSelected ? "#E05C78" : "#000000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isSelected ? 0.1 : 0.05,
                  shadowRadius: 4,
                  elevation: isSelected ? 4 : 2,
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
                        fontWeight: "600",
                        color: "#111827",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      {accessory.name}
                    </Text>
                    <Text
                      style={{
                        color: "#E05C78",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      {type === "SELL"
                        ? formatVNDCustom(accessory.sellPrice, "₫")
                        : formatVNDCustom(accessory.rentalPrice, "₫")}
                    </Text>
                    <Text
                      style={{ color: "#6B7280", marginTop: 4, fontSize: 12 }}
                    >
                      {type === "SELL" ? "Giá mua" : "Giá thuê"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleToggleAccessory(accessory.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isSelected ? "#E05C78" : "#F3F4F6",
                      borderWidth: 1,
                      borderColor: isSelected ? "#E05C78" : "#D1D5DB",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 14,
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
                      marginTop: 16,
                      paddingTop: 16,
                      borderTopWidth: 1,
                      borderTopColor: "#E5E7EB",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          color: "#374151",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        Số lượng:
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            handleUpdateQuantity(accessory.id, quantity - 1)
                          }
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#F3F4F6",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "#D1D5DB",
                          }}
                        >
                          <Ionicons name="remove" size={16} color="#374151" />
                        </TouchableOpacity>

                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "600",
                            color: "#111827",
                            minWidth: 30,
                            textAlign: "center",
                          }}
                        >
                          {quantity}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            handleUpdateQuantity(accessory.id, quantity + 1)
                          }
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#E05C78",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "#E05C78",
                          }}
                        >
                          <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Hiển thị giới hạn số lượng */}
                    <Text
                      style={{
                        color: "#6B7280",
                        fontSize: 12,
                        textAlign: "center",
                        marginTop: 4,
                        fontStyle: "italic",
                      }}
                    >
                      Tối đa: 20 cái
                    </Text>

                    {/* Hiển thị validation error */}
                    {quantityError && (
                      <View
                        style={{
                          marginTop: 8,
                          padding: 8,
                          backgroundColor: "#FEF2F2",
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: "#FECACA",
                        }}
                      >
                        <Text
                          style={{
                            color: "#DC2626",
                            fontSize: 12,
                            textAlign: "center",
                          }}
                        >
                          {quantityError}
                        </Text>
                      </View>
                    )}

                    {/* Hiển thị tổng tiền */}
                    <View
                      style={{
                        marginTop: 8,
                        padding: 8,
                        backgroundColor: "#F0F9FF",
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: "#BAE6FD",
                      }}
                    >
                      <Text
                        style={{
                          color: "#0369A1",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        Tổng:{" "}
                        {formatVNDCustom(
                          (type === "SELL"
                            ? parseFloat(accessory.sellPrice)
                            : parseFloat(accessory.rentalPrice)) * quantity,
                          "₫"
                        )}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {selectedAccessories.length > 0 && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#F0FDF4",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#86EFAC",
          }}
        >
          <Text
            style={{
              color: "#166534",
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Phụ kiện đã chọn ({selectedAccessories.length} loại)
          </Text>
          {selectedAccessories.map((selected) => {
            const accessory = shopAccessories.find(
              (a) => a.id === selected.accessoryId
            );
            if (!accessory) return null;

            const price =
              type === "SELL" ? accessory.sellPrice : accessory.rentalPrice;
            const totalPrice = parseFloat(price) * selected.quantity;

            return (
              <View
                key={selected.accessoryId}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: "#166534", fontSize: 14 }}>
                  {accessory.name} x{selected.quantity}
                </Text>
                <Text
                  style={{ color: "#166534", fontWeight: "600", fontSize: 14 }}
                >
                  {formatVNDCustom(totalPrice, "₫")}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Thông tin đặt cọc cho thuê váy */}
      {type === "RENT" && (
        <View
          style={{
            padding: 16,
            backgroundColor: "#FEF3C7",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#F59E0B",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Ionicons name="card" size={20} color="#D97706" />
            <Text
              style={{
                color: "#92400E",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Thông tin đặt cọc
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#92400E", fontSize: 14 }}>
                Giá thuê váy:
              </Text>
              <Text
                style={{ color: "#92400E", fontWeight: "600", fontSize: 14 }}
              >
                {formatVNDCustom(
                  parseFloat(props.dress?.rentalPrice || "0"),
                  "₫"
                )}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#92400E", fontSize: 14 }}>
                Giá thuê phụ kiện:
              </Text>
              <Text
                style={{ color: "#92400E", fontWeight: "600", fontSize: 14 }}
              >
                {formatVNDCustom(
                  selectedAccessories.reduce((total, selected) => {
                    const accessory = shopAccessories.find(
                      (a) => a.id === selected.accessoryId
                    );
                    if (!accessory) return total;
                    return (
                      total +
                      parseFloat(accessory.rentalPrice) * selected.quantity
                    );
                  }, 0),
                  "₫"
                )}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#92400E", fontSize: 14 }}>
                Giá mua phụ kiện:
              </Text>
              <Text
                style={{ color: "#92400E", fontWeight: "600", fontSize: 14 }}
              >
                {formatVNDCustom(
                  selectedAccessories.reduce((total, selected) => {
                    const accessory = shopAccessories.find(
                      (a) => a.id === selected.accessoryId
                    );
                    if (!accessory) return total;
                    return (
                      total +
                      parseFloat(accessory.sellPrice) * selected.quantity
                    );
                  }, 0),
                  "₫"
                )}
              </Text>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#F59E0B",
                marginVertical: 8,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#92400E", fontSize: 16, fontWeight: "600" }}
              >
                Tổng cộng giá thuê:
              </Text>
              <Text
                style={{ color: "#92400E", fontWeight: "600", fontSize: 16 }}
              >
                {formatVNDCustom(
                  parseFloat(props.dress?.sellPrice || "0") +
                    parseFloat(props.dress?.rentalPrice || "0") +
                    selectedAccessories.reduce((total, selected) => {
                      const accessory = shopAccessories.find(
                        (a) => a.id === selected.accessoryId
                      );
                      if (!accessory) return total;
                      return (
                        total +
                        parseFloat(accessory.rentalPrice) * selected.quantity
                      );
                    }, 0),
                  "₫"
                )}
              </Text>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "#F59E0B",
                marginVertical: 8,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#92400E", fontSize: 16, fontWeight: "600" }}
              >
                Tổng đặt cọc:
              </Text>
              <Text
                style={{ color: "#92400E", fontWeight: "700", fontSize: 18 }}
              >
                {formatVNDCustom(
                  parseFloat(props.dress?.sellPrice || "0") +
                    selectedAccessories.reduce((total, selected) => {
                      const accessory = shopAccessories.find(
                        (a) => a.id === selected.accessoryId
                      );
                      if (!accessory) return total;
                      return (
                        total +
                        parseFloat(accessory.sellPrice) * selected.quantity
                      );
                    }, 0),
                  "₫"
                )}
              </Text>
            </View>

            <Text
              style={{
                color: "#92400E",
                fontSize: 12,
                textAlign: "center",
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              💡 Đặt cọc = Khoản tiền mua váy + Giá mua phụ kiện
            </Text>
            <Text
              style={{
                color: "#92400E",
                fontSize: 12,
                textAlign: "center",
                marginTop: 4,
                fontStyle: "italic",
              }}
            >
              Cọc thừa sẽ hoàn lại sau khi trả váy
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
