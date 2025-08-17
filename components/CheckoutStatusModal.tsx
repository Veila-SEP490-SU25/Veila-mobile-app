import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { formatVNDCustom } from "../utils/currency.util";

interface CheckoutStatusModalProps {
  visible: boolean;
  onClose: () => void;
  status: "SUCCESS" | "PENDING_PAYMENT" | "INSUFFICIENT_BALANCE" | "ERROR";
  orderNumber?: string;
  totalAmount?: number;
  orderType: "SELL" | "RENT";
  onAction?: (action: string) => void;
}

export default function CheckoutStatusModal({
  visible,
  onClose,
  status,
  orderNumber,
  totalAmount,
  orderType,
  onAction,
}: CheckoutStatusModalProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "SUCCESS":
        return {
          icon: "checkmark-circle",
          iconColor: "#10B981",
          title: "Đặt hàng thành công!",
          subtitle: "Đơn hàng của bạn đã được xác nhận",
          description:
            "Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận chi tiết đơn hàng.",
          primaryAction: "Xem đơn hàng",
          secondaryAction: "Tiếp tục mua sắm",
          primaryActionType: "success",
        };

      case "PENDING_PAYMENT":
        return {
          icon: "time",
          iconColor: "#F59E0B",
          title: "Đặt hàng thành công!",
          subtitle: "Vui lòng hoàn tất thanh toán",
          description:
            "Đơn hàng đã được tạo nhưng cần thanh toán để xác nhận. Vui lòng kiểm tra email để biết thêm chi tiết.",
          primaryAction: "Thanh toán ngay",
          secondaryAction: "Xem đơn hàng",
          primaryActionType: "warning",
        };

      case "INSUFFICIENT_BALANCE":
        return {
          icon: "wallet-outline",
          iconColor: "#EF4444",
          title: "Số dư không đủ",
          subtitle: "Vui lòng nạp thêm tiền vào ví",
          description: `Để hoàn tất đơn hàng ${orderType === "SELL" ? "mua" : "thuê"} váy, bạn cần nạp thêm ${totalAmount ? formatVNDCustom(totalAmount, "₫") : ""} vào ví.`,
          primaryAction: "Nạp tiền ngay",
          secondaryAction: "Xem ví",
          primaryActionType: "error",
        };

      case "ERROR":
        return {
          icon: "alert-circle",
          iconColor: "#EF4444",
          title: "Có lỗi xảy ra",
          subtitle: "Không thể hoàn tất đặt hàng",
          description:
            "Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
          primaryAction: "Thử lại",
          secondaryAction: "Liên hệ hỗ trợ",
          primaryActionType: "error",
        };

      default:
        return {
          icon: "information-circle",
          iconColor: "#6B7280",
          title: "Trạng thái không xác định",
          subtitle: "Vui lòng kiểm tra lại",
          description:
            "Không thể xác định trạng thái đơn hàng. Vui lòng kiểm tra email hoặc trang đơn hàng.",
          primaryAction: "Xem đơn hàng",
          secondaryAction: "Đóng",
          primaryActionType: "info",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handlePrimaryAction = () => {
    if (onAction) {
      switch (status) {
        case "SUCCESS":
          onAction("VIEW_ORDER");
          break;
        case "PENDING_PAYMENT":
          onAction("PAY_NOW");
          break;
        case "INSUFFICIENT_BALANCE":
          onAction("TOPUP_WALLET");
          break;
        case "ERROR":
          onAction("RETRY");
          break;
        default:
          onAction("VIEW_ORDER");
      }
    }
    onClose();
  };

  const handleSecondaryAction = () => {
    if (onAction) {
      switch (status) {
        case "SUCCESS":
          onAction("CONTINUE_SHOPPING");
          break;
        case "PENDING_PAYMENT":
          onAction("VIEW_ORDER");
          break;
        case "INSUFFICIENT_BALANCE":
          onAction("VIEW_WALLET");
          break;
        case "ERROR":
          onAction("CONTACT_SUPPORT");
          break;
        default:
          onAction("CLOSE");
      }
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Status Icon */}
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${statusInfo.iconColor}20` }}
            >
              <Ionicons
                name={statusInfo.icon as any}
                size={40}
                color={statusInfo.iconColor}
              />
            </View>

            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              {statusInfo.title}
            </Text>

            <Text className="text-gray-600 text-center">
              {statusInfo.subtitle}
            </Text>
          </View>

          {/* Order Details */}
          {orderNumber && (
            <View className="bg-gray-50 rounded-lg p-4 mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Thông tin đơn hàng:
              </Text>
              <Text className="text-gray-600">
                Mã đơn hàng:{" "}
                <Text className="font-semibold">{orderNumber}</Text>
              </Text>
              {totalAmount && (
                <Text className="text-gray-600 mt-1">
                  Tổng tiền:{" "}
                  <Text className="font-semibold text-primary-600">
                    {formatVNDCustom(totalAmount, "₫")}
                  </Text>
                </Text>
              )}
              <Text className="text-gray-600 mt-1">
                Loại:{" "}
                <Text className="font-semibold">
                  {orderType === "SELL" ? "Mua váy" : "Thuê váy"}
                </Text>
              </Text>
            </View>
          )}

          {/* Description */}
          <Text className="text-gray-600 text-center mb-6 leading-5">
            {statusInfo.description}
          </Text>

          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              className={`py-3 px-4 rounded-xl items-center ${
                statusInfo.primaryActionType === "success"
                  ? "bg-green-500"
                  : statusInfo.primaryActionType === "warning"
                    ? "bg-yellow-500"
                    : statusInfo.primaryActionType === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
              }`}
              onPress={handlePrimaryAction}
            >
              <Text className="text-white font-semibold text-base">
                {statusInfo.primaryAction}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 px-4 rounded-xl items-center border border-gray-300"
              onPress={handleSecondaryAction}
            >
              <Text className="text-gray-700 font-medium text-base">
                {statusInfo.secondaryAction}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
