import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../../../components/Button";
import { customRequestApi } from "../../../../services/apis/custom-request.api";
import { CustomRequestUpdate } from "../../../../services/types";

export default function EditCustomRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CustomRequestUpdate>({
    title: "",
    description: "",
    height: 0,
    weight: 0,
    bust: 0,
    waist: 0,
    hip: 0,
    armpit: 0,
    bicep: 0,
    neck: 0,
    shoulderWidth: 0,
    sleeveLength: 0,
    backLength: 0,
    lowerWaist: 0,
    waistToFloor: 0,
    isPrivate: false,
    status: "DRAFT",
  });

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customRequestApi.getRequestById(id);
      if (response.statusCode === 200 || response.statusCode === 201) {
        const request = response.item;
        setFormData({
          title: request.title,
          description: request.description,
          height: request.height,
          weight: request.weight,
          bust: request.bust,
          waist: request.waist,
          hip: request.hip,
          armpit: request.armpit,
          bicep: request.bicep,
          neck: request.neck,
          shoulderWidth: request.shoulderWidth,
          sleeveLength: request.sleeveLength,
          backLength: request.backLength,
          lowerWaist: request.lowerWaist,
          waistToFloor: request.waistToFloor,
          isPrivate: request.isPrivate,
          status:
            request.status === "DRAFT" || request.status === "SUBMIT"
              ? request.status
              : "DRAFT",
        });
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

  const updateField = (
    field: keyof CustomRequestUpdate,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title?.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập tiêu đề yêu cầu",
      });
      return;
    }
    if (!formData.description?.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập mô tả yêu cầu",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await customRequestApi.updateRequest(id, formData);
      if (response.statusCode === 200 || response.statusCode === 201) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã cập nhật yêu cầu đặt may",
        });
        router.back();
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error updating request:", error);
      }
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể cập nhật yêu cầu. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderInputField = (
    label: string,
    field: keyof CustomRequestUpdate,
    placeholder: string,
    keyboardType: "default" | "numeric" = "default",
    multiline = false
  ) => (
    <View className="mb-4">
      <Text className="text-base font-medium text-gray-700 mb-2">{label}</Text>
      <TextInput
        className={`bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 ${
          multiline ? "min-h-[80px]" : ""
        }`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={formData[field]?.toString() || ""}
        onChangeText={(text) => {
          if (keyboardType === "numeric") {
            const num = parseFloat(text) || 0;
            updateField(field, num);
          } else {
            updateField(field, text);
          }
        }}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );

  const renderMeasurementSection = () => (
    <View className="bg-white rounded-2xl p-4 mb-6 shadow-soft">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Kích thước cơ thể
      </Text>

      <View className="flex-row space-x-3">
        {renderInputField("Chiều cao (cm)", "height", "170", "numeric")}
        {renderInputField("Cân nặng (kg)", "weight", "55", "numeric")}
      </View>

      <View className="flex-row space-x-3">
        {renderInputField("Vòng ngực (cm)", "bust", "85", "numeric")}
        {renderInputField("Vòng eo (cm)", "waist", "60", "numeric")}
      </View>

      <View className="flex-row space-x-3">
        {renderInputField("Vòng mông (cm)", "hip", "90", "numeric")}
        {renderInputField("Vòng nách (cm)", "armpit", "40", "numeric")}
      </View>

      <View className="flex-row space-x-3">
        {renderInputField("Vòng bắp tay (cm)", "bicep", "30", "numeric")}
        {renderInputField("Vòng cổ (cm)", "neck", "35", "numeric")}
      </View>

      <View className="flex-row space-x-3">
        {renderInputField("Vai (cm)", "shoulderWidth", "40", "numeric")}
        {renderInputField("Tay áo (cm)", "sleeveLength", "60", "numeric")}
      </View>

      <View className="flex-row space-x-3">
        {renderInputField("Lưng (cm)", "backLength", "40", "numeric")}
        {renderInputField("Eo dưới (cm)", "lowerWaist", "90", "numeric")}
      </View>

      <View className="flex-row space-x-3">
        {renderInputField("Eo đến sàn (cm)", "waistToFloor", "60", "numeric")}
        <View className="flex-1" />
      </View>
    </View>
  );

  // const renderDesignSection = () => (
  //   <View className="bg-white rounded-2xl p-4 mb-6 shadow-soft">
  //     <Text className="text-lg font-semibold text-gray-800 mb-4">
  //       Thiết kế váy
  //     </Text>

  //     {renderInputField(
  //       "Kiểu váy",
  //       "dressStyle",
  //       "Váy ngắn hoặc vạt trước ngắn vạt sau dài",
  //       "default",
  //       true
  //     )}
  //     {renderInputField(
  //       "Kiểu cổ",
  //       "curtainNeckline",
  //       "Cổ tim, cổ tròn, cổ thuyền, cổ yếm, cúp ngực",
  //       "default",
  //       true
  //     )}
  //     {renderInputField(
  //       "Kiểu tay",
  //       "sleeveStyle",
  //       "Không tay, hai dây, tay trần, tay ngắn",
  //       "default",
  //       true
  //     )}
  //     {renderInputField(
  //       "Chất liệu",
  //       "material",
  //       "Kim sa, Đính kết pha lê/ngọc trai",
  //       "default",
  //       true
  //     )}
  //     {renderInputField(
  //       "Màu sắc",
  //       "color",
  //       "Trắng tinh, trắng ngà (ivory), kem",
  //       "default",
  //       true
  //     )}
  //     {renderInputField(
  //       "Chi tiết đặc biệt",
  //       "specialElement",
  //       "Đính kết pha lê, hoa văn 3D",
  //       "default",
  //       true
  //     )}
  //     {renderInputField(
  //       "Mức độ hở",
  //       "coverage",
  //       "Mức độ hở lưng, xẻ ngực",
  //       "default",
  //       true
  //     )}
  //   </View>
  // );

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
            Chỉnh sửa yêu cầu
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Basic Information */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-soft">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </Text>

            {renderInputField(
              "Tiêu đề yêu cầu",
              "title",
              "Yêu cầu thiết kế váy cưới"
            )}
            {renderInputField(
              "Mô tả chi tiết",
              "description",
              "Mô tả chi tiết về yêu cầu của bạn...",
              "default",
              true
            )}
          </View>

          {/* Measurements */}
          {renderMeasurementSection()}

          {/* Design Preferences */}
          {/* {renderDesignSection()} */}

          {/* Privacy Settings */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-soft">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Cài đặt riêng tư
            </Text>

            <TouchableOpacity
              className="flex-row items-center justify-between p-3 border border-gray-200 rounded-xl"
              onPress={() => updateField("isPrivate", !formData.isPrivate)}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={formData.isPrivate ? "lock-closed" : "globe"}
                  size={20}
                  color={formData.isPrivate ? "#EF4444" : "#10B981"}
                />
                <View className="ml-3">
                  <Text className="text-base font-medium text-gray-800">
                    {formData.isPrivate ? "Riêng tư" : "Công khai"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {formData.isPrivate
                      ? "Chỉ bạn có thể xem yêu cầu này"
                      : "Mọi người có thể xem yêu cầu này"}
                  </Text>
                </View>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  formData.isPrivate
                    ? "border-red-500 bg-red-500"
                    : "border-green-500 bg-green-500"
                }`}
              >
                {formData.isPrivate && (
                  <View className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <Button
            title={saving ? "Đang cập nhật..." : "Cập nhật yêu cầu"}
            onPress={handleSubmit}
            disabled={saving}
            loading={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
