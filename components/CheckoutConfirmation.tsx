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

  // Format ngày để hiển thị đẹp hơn
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Tính số ngày thuê
  const calculateRentalDays = () => {
    if (orderData.dueDate && orderData.returnDate) {
      const dueDate = new Date(orderData.dueDate);
      const returnDate = new Date(orderData.returnDate);
      return Math.ceil(
        (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    return 0;
  };

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
                : (() => {
                    // Tính số ngày thuê
                    if (orderData.dueDate && orderData.returnDate) {
                      const dueDate = new Date(orderData.dueDate);
                      const returnDate = new Date(orderData.returnDate);
                      const rentalDays = Math.ceil(
                        (returnDate.getTime() - dueDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return `${formatVNDCustom(dress.rentalPrice, "₫")} / ${rentalDays} ngày`;
                    } else if (orderData.dueDate) {
                      return `${formatVNDCustom(dress.rentalPrice, "₫")} / ngày`;
                    } else {
                      return formatVNDCustom(dress.rentalPrice, "₫");
                    }
                  })()}
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

              // Tính tổng giá phụ kiện thuê dựa trên số ngày
              let totalPrice;
              if (
                type === "RENT" &&
                orderData.dueDate &&
                orderData.returnDate
              ) {
                const dueDate = new Date(orderData.dueDate);
                const returnDate = new Date(orderData.returnDate);
                const rentalDays = Math.ceil(
                  (returnDate.getTime() - dueDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                totalPrice = parseFloat(price) * selected.quantity * rentalDays;
              } else {
                totalPrice = parseFloat(price) * selected.quantity;
              }

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
                      {type === "SELL"
                        ? `${formatVNDCustom(price, "₫")} / cái`
                        : (() => {
                            if (orderData.dueDate && orderData.returnDate) {
                              const dueDate = new Date(orderData.dueDate);
                              const returnDate = new Date(orderData.returnDate);
                              const rentalDays = Math.ceil(
                                (returnDate.getTime() - dueDate.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              return `${formatVNDCustom(price, "₫")} / cái / ${rentalDays} ngày`;
                            } else {
                              return `${formatVNDCustom(price, "₫")} / cái / ngày`;
                            }
                          })()}
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
              Ngày giao: {formatDate(orderData.dueDate)}
            </Text>
          )}
          {type === "RENT" && orderData.returnDate && (
            <Text style={{ color: "#1D4ED8", fontSize: 14 }}>
              Ngày trả: {formatDate(orderData.returnDate)}
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

        {type === "RENT" && (
          <View
            style={{
              padding: 16,
              backgroundColor: "#FEF3C7",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#F59E0B",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: "#92400E",
                marginBottom: 12,
                fontSize: 16,
              }}
            >
              Thông tin đặt cọc
            </Text>

            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#92400E", fontSize: 14 }}>
                  Giá mua váy:
                </Text>
                <Text
                  style={{ color: "#92400E", fontWeight: "600", fontSize: 14 }}
                >
                  {formatVNDCustom(dress?.sellPrice || "0", "₫")}
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
                  Giá thuê váy:
                </Text>
                <Text
                  style={{ color: "#92400E", fontWeight: "600", fontSize: 14 }}
                >
                  {(() => {
                    if (orderData.dueDate && orderData.returnDate) {
                      const dueDate = new Date(orderData.dueDate);
                      const returnDate = new Date(orderData.returnDate);
                      const rentalDays = Math.ceil(
                        (returnDate.getTime() - dueDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const totalRentalPrice =
                        parseFloat(dress?.rentalPrice || "0") * rentalDays;
                      return `${formatVNDCustom(totalRentalPrice, "₫")} (${rentalDays} ngày)`;
                    } else {
                      return formatVNDCustom(dress?.rentalPrice || "0", "₫");
                    }
                  })()}
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
                    (() => {
                      if (orderData.dueDate && orderData.returnDate) {
                        const dueDate = new Date(orderData.dueDate);
                        const returnDate = new Date(orderData.returnDate);
                        const rentalDays = Math.ceil(
                          (returnDate.getTime() - dueDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return selectedAccessories.reduce((total, selected) => {
                          const accessory = shopAccessories.find(
                            (a) => a.id === selected.accessoryId
                          );
                          if (!accessory) return total;
                          return (
                            total +
                            parseFloat(accessory.rentalPrice) *
                              selected.quantity *
                              rentalDays
                          );
                        }, 0);
                      } else {
                        return selectedAccessories.reduce((total, selected) => {
                          const accessory = shopAccessories.find(
                            (a) => a.id === selected.accessoryId
                          );
                          if (!accessory) return total;
                          return (
                            total +
                            parseFloat(accessory.rentalPrice) *
                              selected.quantity
                          );
                        }, 0);
                      }
                    })(),
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
                    (() => {
                      if (orderData.dueDate && orderData.returnDate) {
                        const dueDate = new Date(orderData.dueDate);
                        const returnDate = new Date(orderData.returnDate);
                        const rentalDays = Math.ceil(
                          (returnDate.getTime() - dueDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );

                        // Tính tổng giá thuê váy
                        const dressRentalTotal =
                          parseFloat(dress?.rentalPrice || "0") * rentalDays;

                        // Tính tổng giá thuê phụ kiện
                        const accessoriesRentalTotal =
                          selectedAccessories.reduce((total, selected) => {
                            const accessory = shopAccessories.find(
                              (a) => a.id === selected.accessoryId
                            );
                            if (!accessory) return total;
                            return (
                              total +
                              parseFloat(accessory.rentalPrice) *
                                selected.quantity *
                                rentalDays
                            );
                          }, 0);

                        return dressRentalTotal + accessoriesRentalTotal;
                      } else {
                        return (
                          parseFloat(dress?.rentalPrice || "0") +
                          selectedAccessories.reduce((total, selected) => {
                            const accessory = shopAccessories.find(
                              (a) => a.id === selected.accessoryId
                            );
                            if (!accessory) return total;
                            return (
                              total +
                              parseFloat(accessory.rentalPrice) *
                                selected.quantity
                            );
                          }, 0)
                        );
                      }
                    })(),
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
                  borderTopWidth: 1,
                  borderTopColor: "#F59E0B",
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
                    style={{
                      color: "#92400E",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Tổng đặt cọc:
                  </Text>
                  <Text
                    style={{
                      color: "#92400E",
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {formatVNDCustom(
                      parseFloat(dress?.sellPrice || "0") +
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
                  fontStyle: "italic",
                }}
              >
                Cọc thừa sẽ hoàn lại sau khi trả váy
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
