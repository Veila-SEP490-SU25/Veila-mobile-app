import React from "react";
import { Text, View } from "react-native";
import { AccessoryDetail } from "../services/apis/order.api";
import { Accessory } from "../services/types";
import { Dress } from "../services/types/dress.type";
import { formatVNDCustom } from "../utils/currency.util";

type CheckoutConfirmationProps = {
  dress: Dress | null;
  selectedAccessories: AccessoryDetail[];
  shopAccessories: Accessory[];
  orderData: {
    phone: string;
    email: string;
    address: string;
    dueDate: string | null;
    returnDate: string | null;
  };
  type: "SELL" | "RENT";
  calculateTotalPrice: () => number;
};

export default function CheckoutConfirmation(props: CheckoutConfirmationProps) {
  const {
    dress,
    selectedAccessories,
    shopAccessories,
    orderData,
    type,
    calculateTotalPrice,
  } = props;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
          Xác nhận đơn hàng
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {dress && (
          <View
            style={{
              padding: 12,
              backgroundColor: "#F9FAFB",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Thông tin váy
            </Text>
            <Text style={{ color: "#374151", marginBottom: 4, fontSize: 14 }}>
              {dress.name}
            </Text>
            <Text style={{ color: "#E05C78", fontWeight: "600", fontSize: 16 }}>
              {type === "SELL"
                ? formatVNDCustom(dress.sellPrice, "₫")
                : formatVNDCustom(dress.rentalPrice, "₫")}
            </Text>
            {dress.category && (
              <Text style={{ color: "#6B7280", marginTop: 4, fontSize: 12 }}>
                Danh mục: {dress.category.name}
              </Text>
            )}
          </View>
        )}

        {selectedAccessories.length > 0 && (
          <View
            style={{
              padding: 12,
              backgroundColor: "#F9FAFB",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Phụ kiện đã chọn ({selectedAccessories.length})
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
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#374151", fontSize: 14 }}>
                      {accessory.name} x{selected.quantity}
                    </Text>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>
                      {formatVNDCustom(price, "₫")} / cái
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#111827",
                      fontWeight: "500",
                      fontSize: 14,
                    }}
                  >
                    {formatVNDCustom(totalPrice, "₫")}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View
          style={{
            padding: 12,
            backgroundColor: "#DBEAFE",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#93C5FD",
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              color: "#1E40AF",
              marginBottom: 8,
              fontSize: 14,
            }}
          >
            Thông tin khách hàng
          </Text>
          <Text style={{ color: "#1D4ED8", marginBottom: 4, fontSize: 14 }}>
            SĐT: {orderData.phone}
          </Text>
          <Text style={{ color: "#1D4ED8", marginBottom: 4, fontSize: 14 }}>
            Email: {orderData.email}
          </Text>
          <Text style={{ color: "#1D4ED8", marginBottom: 4, fontSize: 14 }}>
            Địa chỉ: {orderData.address}
          </Text>
          {orderData.dueDate && (
            <Text style={{ color: "#1D4ED8", marginBottom: 4, fontSize: 14 }}>
              Ngày giao: {orderData.dueDate}
            </Text>
          )}
          {type === "RENT" && orderData.returnDate && (
            <Text style={{ color: "#1D4ED8", fontSize: 14 }}>
              Ngày trả: {orderData.returnDate}
            </Text>
          )}
        </View>

        <View
          style={{
            padding: 12,
            backgroundColor: "#FDF2F8",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#F9A8D4",
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              color: "#BE185D",
              marginBottom: 4,
              fontSize: 14,
            }}
          >
            Loại đơn hàng: {type === "SELL" ? "Mua váy" : "Thuê váy"}
          </Text>
          <Text style={{ color: "#BE185D", fontSize: 12 }}>
            {type === "SELL"
              ? "Bạn sẽ sở hữu váy này vĩnh viễn"
              : "Bạn sẽ thuê váy trong thời gian nhất định"}
          </Text>
        </View>

        <View
          style={{
            padding: 16,
            backgroundColor: "#F0FDF4",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#86EFAC",
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              color: "#166534",
              marginBottom: 12,
              fontSize: 16,
            }}
          >
            Chi tiết giá
          </Text>

          {dress && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#166534", fontSize: 14 }}>
                {dress.name} ({type === "SELL" ? "Mua" : "Thuê"})
              </Text>
              <Text
                style={{ color: "#166534", fontWeight: "500", fontSize: 14 }}
              >
                {type === "SELL"
                  ? formatVNDCustom(dress.sellPrice, "₫")
                  : formatVNDCustom(dress.rentalPrice, "₫")}
              </Text>
            </View>
          )}

          {selectedAccessories.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#166534", fontSize: 14 }}>
                Phụ kiện ({selectedAccessories.length} loại)
              </Text>
              <Text
                style={{ color: "#166534", fontWeight: "500", fontSize: 14 }}
              >
                {formatVNDCustom(
                  selectedAccessories.reduce((total, selected) => {
                    const accessory = shopAccessories.find(
                      (a) => a.id === selected.accessoryId
                    );
                    if (!accessory) return total;
                    const price =
                      type === "SELL"
                        ? accessory.sellPrice
                        : accessory.rentalPrice;
                    return total + parseFloat(price) * selected.quantity;
                  }, 0),
                  "₫"
                )}
              </Text>
            </View>
          )}

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#86EFAC",
              paddingTop: 8,
              marginTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontWeight: "600", color: "#166534", fontSize: 16 }}
              >
                Tổng cộng
              </Text>
              <Text
                style={{ fontWeight: "bold", color: "#166534", fontSize: 18 }}
              >
                {formatVNDCustom(calculateTotalPrice(), "₫")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
