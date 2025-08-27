import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  confirmDelete,
  confirmLogout,
  confirmOrderCancel,
  showLoginError,
  showMessage,
  showNetworkError,
  showOrderSuccess,
  showOTPError,
  showPaymentSuccess,
  showSessionExpired,
  showWalletError,
} from "../utils/message.util";

export default function MessageDemoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🧪 Veila Message System Demo
        </Text>

        {/* Success Messages */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-green-600 mb-3">
            ✅ Thành công (Success)
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-green-500 p-3 rounded-lg"
              onPress={() => showMessage("SUC001")}
            >
              <Text className="text-white font-medium">
                SUC001 - Nạp tiền thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-500 p-3 rounded-lg"
              onPress={() => showPaymentSuccess()}
            >
              <Text className="text-white font-medium">
                SUC002 - Thanh toán thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-500 p-3 rounded-lg"
              onPress={() => showOrderSuccess()}
            >
              <Text className="text-white font-medium">
                SUC003 - Đặt hàng thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-500 p-3 rounded-lg"
              onPress={() => showMessage("SUC004")}
            >
              <Text className="text-white font-medium">
                SUC004 - Cập nhật hồ sơ thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-500 p-3 rounded-lg"
              onPress={() => showMessage("SUC005")}
            >
              <Text className="text-white font-medium">
                SUC005 - Thêm địa chỉ thành công
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Messages */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-red-600 mb-3">
            ❌ Lỗi (Error)
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showLoginError()}
            >
              <Text className="text-white font-medium">
                ERM001 - Đăng nhập sai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showMessage("ERM002")}
            >
              <Text className="text-white font-medium">
                ERM002 - Email đã tồn tại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showOTPError()}
            >
              <Text className="text-white font-medium">
                ERM003 - Mã OTP không hợp lệ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showWalletError()}
            >
              <Text className="text-white font-medium">
                ERM004 - Số dư ví không đủ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showMessage("ERM005")}
            >
              <Text className="text-white font-medium">
                ERM005 - Thanh toán thất bại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showMessage("ERM006")}
            >
              <Text className="text-white font-medium">
                ERM006 - Không thể xử lý đơn hàng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showMessage("ERM007")}
            >
              <Text className="text-white font-medium">
                ERM007 - Địa chỉ không hợp lệ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 p-3 rounded-lg"
              onPress={() => showMessage("ERM008")}
            >
              <Text className="text-white font-medium">
                ERM008 - Không có quyền truy cập
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Messages */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-blue-600 mb-3">
            🔧 Hệ thống (System)
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg"
              onPress={() => showSessionExpired()}
            >
              <Text className="text-white font-medium">
                SSM001 - Phiên đăng nhập hết hạn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg"
              onPress={() => showMessage("SSM002")}
            >
              <Text className="text-white font-medium">
                SSM002 - Hệ thống bảo trì
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 p-3 rounded-lg"
              onPress={() => showNetworkError()}
            >
              <Text className="text-white font-medium">
                SSM003 - Mất kết nối mạng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Messages */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-purple-600 mb-3">
            ℹ️ Thông tin (Info)
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-purple-500 p-3 rounded-lg"
              onPress={() => showMessage("INF001")}
            >
              <Text className="text-white font-medium">
                INF001 - Cập nhật trạng thái đơn hàng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-500 p-3 rounded-lg"
              onPress={() => showMessage("INF002")}
            >
              <Text className="text-white font-medium">
                INF002 - Tin nhắn mới từ nhà cung cấp
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-500 p-3 rounded-lg"
              onPress={() => showMessage("INF003")}
            >
              <Text className="text-white font-medium">
                INF003 - Gửi đánh giá thành công
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-500 p-3 rounded-lg"
              onPress={() => showMessage("INF004")}
            >
              <Text className="text-white font-medium">
                INF004 - Bài viết mới được đăng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-500 p-3 rounded-lg"
              onPress={() => showMessage("INF005")}
            >
              <Text className="text-white font-medium">
                INF005 - Gói đăng ký sắp hết hạn
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmation Messages */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-orange-600 mb-3">
            ❓ Xác nhận (Confirm)
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-orange-500 p-3 rounded-lg"
              onPress={() =>
                confirmOrderCancel(() => {
                  /* Demo confirmation */
                })
              }
            >
              <Text className="text-white font-medium">
                CFM001 - Xác nhận hủy đơn hàng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-orange-500 p-3 rounded-lg"
              onPress={() =>
                confirmLogout(() => {
                  /* Demo confirmation */
                })
              }
            >
              <Text className="text-white font-medium">
                CFM002 - Xác nhận đăng xuất
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-orange-500 p-3 rounded-lg"
              onPress={() => showMessage("CFM003")}
            >
              <Text className="text-white font-medium">
                CFM003 - Xác nhận nạp tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-orange-500 p-3 rounded-lg"
              onPress={() =>
                confirmDelete(() => {
                  /* Demo confirmation */
                })
              }
            >
              <Text className="text-white font-medium">
                CFM004 - Xác nhận xóa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning Messages */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-yellow-600 mb-3">
            ⚠️ Cảnh báo (Warning)
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              className="bg-yellow-500 p-3 rounded-lg"
              onPress={() => showMessage("WRN001")}
            >
              <Text className="text-white font-medium">
                WRN001 - Không thể chỉnh sửa đơn hàng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-sm text-gray-600 text-center mt-4 mb-8">
          🎯 Demo các message codes đã được tích hợp vào Veila app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
