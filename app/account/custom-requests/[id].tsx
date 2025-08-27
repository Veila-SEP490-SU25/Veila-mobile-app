import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { customRequestApi } from "../../../services/apis/custom-request.api";
import { CustomRequest } from "../../../services/types";

const STATUS_COLORS = {
  DRAFT: "#6B7280",
  SUBMIT: "#3B82F6",
};

const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  SUBMIT: "Đã đăng",
};

export default function CustomRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customRequestApi.getRequestById(id);
      if (response.statusCode === 200 || response.statusCode === 201) {
        setRequest(response.item);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error loading request:", error);
      }
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin yêu cầu",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id, loadRequest]);

  const handleDelete = () => {
    Toast.show({
      type: "info",
      text1: "Xác nhận xóa",
      text2: "Bạn có chắc chắn muốn xóa yêu cầu này?",
      onPress: () => {

        Toast.show({
          type: "info",
          text1: "Xác nhận",
          text2: "Nhấn lại để xác nhận xóa",
          onPress: () => deleteRequest(),
        });
      },
    });
  };

  const deleteRequest = async () => {
    try {
      await customRequestApi.deleteRequest(id);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa yêu cầu",
      });
      router.back();
    } catch (error) {
      if (__DEV__) {
        console.error("Error deleting request:", error);
      }
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xóa yêu cầu",
      });
    }
  };

  const renderInfoSection = (title: string, children: React.ReactNode) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      {children}
    </View>
  );

  const renderMeasurementGrid = () => (
    <View className="space-y-2">
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Chiều cao</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.height} cm
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Cân nặng</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.weight} kg
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vòng ngực</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.bust} cm
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vòng eo</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.waist} cm
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vòng mông</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.hip} cm
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vòng nách</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.armpit} cm
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vòng bắp tay</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.bicep} cm
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vòng cổ</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.neck} cm
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Vai</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.shoulderWidth} cm
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Tay áo</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.sleeveLength} cm
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Lưng</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.backLength} cm
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Eo dưới</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.lowerWaist} cm
          </Text>
        </View>
      </View>

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">Eo đến sàn</Text>
          <Text className="text-base font-medium text-gray-800">
            {request?.waistToFloor} cm
          </Text>
        </View>
        <View className="flex-1" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">
            Đang tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="document-text-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            Không tìm thấy yêu cầu
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-6 mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Chi tiết yêu cầu
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Status and Basic Info */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-soft">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                {request.title}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${STATUS_COLORS[request.status]}15`,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: STATUS_COLORS[request.status] }}
                >
                  {STATUS_LABELS[request.status]}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 mb-3">{request.description}</Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-500 ml-1">
                  {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons
                  name={request.isPrivate ? "lock-closed" : "globe"}
                  size={16}
                  color={request.isPrivate ? "#EF4444" : "#10B981"}
                />
                <Text className="text-sm text-gray-500 ml-1">
                  {request.isPrivate ? "Riêng tư" : "Công khai"}
                </Text>
              </View>
            </View>
          </View>

          {/* Measurements */}
          {renderInfoSection("Kích thước cơ thể", renderMeasurementGrid())}

          {/* Design Preferences */}
          {/* {renderInfoSection(
            "Thiết kế váy",
            <View className="space-y-3">
              {renderInfoRow("Kiểu váy", request.dressStyle)}
              {renderInfoRow("Kiểu cổ", request.curtainNeckline)}
              {renderInfoRow("Kiểu tay", request.sleeveStyle)}
              {renderInfoRow("Chất liệu", request.material)}
              {renderInfoRow("Màu sắc", request.color)}
              {renderInfoRow("Chi tiết đặc biệt", request.specialElement)}
              {renderInfoRow("Mức độ hở", request.coverage)}
            </View>
          )} */}

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-8">
            <TouchableOpacity
              className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
              onPress={() =>
                router.push(`/account/custom-requests/${id}/edit` as any)
              }
            >
              <Text className="text-white font-semibold">Chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
              onPress={() => console.log("Share request")}
            >
              <Text className="text-white font-semibold">Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
