import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import { LightStatusBar } from "../../../components/StatusBar";
import { customRequestApi } from "../../../services/apis/custom-request.api";
import { CustomRequestCreate } from "../../../services/types";

export default function CreateCustomRequestScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomRequestCreate>({
    title: "",
    description: "",
    images: "",
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
    status: "DRAFT",
    isPrivate: false,
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập tiêu đề yêu cầu",
      });
      return;
    }

    if (!formData.description.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập mô tả yêu cầu",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await customRequestApi.createRequest(formData);

      // Log response for debugging (only in development)
      if (__DEV__) {
        console.log("API Response:", response);
      }

      // Check for successful status codes (200 OK or 201 Created)
      if (
        response &&
        (response.statusCode === 200 || response.statusCode === 201)
      ) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: response.message || "Đã tạo yêu cầu mới",
        });
        router.back();
      } else {
        // Unexpected response format
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Phản hồi không hợp lệ từ máy chủ",
        });
      }
    } catch (error) {
      console.error("Error creating request:", error);

      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tạo yêu cầu. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    field: keyof CustomRequestCreate,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderInputField = (
    label: string,
    field: keyof CustomRequestCreate,
    placeholder: string,
    keyboardType: "default" | "numeric" = "default",
    multiline: boolean = false
  ) => (
    <View className="mb-4">
      <Text className="text-base font-medium text-gray-700 mb-2">{label}</Text>
      <Input
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LightStatusBar />

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
            Tạo yêu cầu đặt may
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Basic Information */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề yêu cầu <Text className="text-red-500">*</Text>
                </Text>
                <Input
                  value={formData.title}
                  onChangeText={(text: string) => updateField("title", text)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  placeholder="Yêu cầu thiết kế váy cưới"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Mô tả chi tiết <Text className="text-red-500">*</Text>
                </Text>
                <Input
                  value={formData.description}
                  onChangeText={(text: string) =>
                    updateField("description", text)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white min-h-[80px]"
                  placeholder="Mô tả chi tiết về yêu cầu của bạn..."
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </Card>

          {/* Measurements */}
          {renderMeasurementSection()}

          {/* Status Selection */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Trạng thái yêu cầu
            </Text>

            <View className="space-y-3">
              <TouchableOpacity
                className={`flex-row items-center justify-between p-4 border-2 rounded-xl ${
                  formData.status === "DRAFT"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-gray-50"
                }`}
                onPress={() => updateField("status", "DRAFT")}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-6 h-6 rounded-full border-2 mr-3 ${
                      formData.status === "DRAFT"
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.status === "DRAFT" && (
                      <View className="w-2 h-2 bg-white rounded-full m-auto" />
                    )}
                  </View>
                  <View>
                    <Text
                      className={`text-base font-medium ${
                        formData.status === "DRAFT"
                          ? "text-primary-600"
                          : "text-gray-700"
                      }`}
                    >
                      Lưu nháp
                    </Text>
                    <Text
                      className={`text-sm ${
                        formData.status === "DRAFT"
                          ? "text-primary-500"
                          : "text-gray-500"
                      }`}
                    >
                      Lưu yêu cầu để chỉnh sửa sau
                    </Text>
                  </View>
                </View>
                <Badge
                  variant={formData.status === "DRAFT" ? "primary" : "default"}
                  outlined={formData.status !== "DRAFT"}
                  icon="save-outline"
                >
                  {formData.status === "DRAFT" ? "Đã chọn" : ""}
                </Badge>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center justify-between p-4 border-2 rounded-xl ${
                  formData.status === "SUBMIT"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-gray-50"
                }`}
                onPress={() => updateField("status", "SUBMIT")}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-6 h-6 rounded-full border-2 mr-3 ${
                      formData.status === "SUBMIT"
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.status === "SUBMIT" && (
                      <View className="w-2 h-2 bg-white rounded-full m-auto" />
                    )}
                  </View>
                  <View>
                    <Text
                      className={`text-base font-medium ${
                        formData.status === "SUBMIT"
                          ? "text-primary-600"
                          : "text-gray-700"
                      }`}
                    >
                      Gửi yêu cầu
                    </Text>
                    <Text
                      className={`text-sm ${
                        formData.status === "SUBMIT"
                          ? "text-primary-500"
                          : "text-gray-500"
                      }`}
                    >
                      Gửi yêu cầu để chúng tôi xem xét
                    </Text>
                  </View>
                </View>
                <Badge
                  variant={formData.status === "SUBMIT" ? "primary" : "default"}
                  outlined={formData.status !== "SUBMIT"}
                  icon="paper-plane"
                >
                  {formData.status === "SUBMIT" ? "Đã chọn" : ""}
                </Badge>
              </TouchableOpacity>
            </View>
          </Card>

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
          <View className="mb-8">
            <Button
              title={
                formData.status === "DRAFT" ? "Lưu nháp" : "Gửi yêu cầu đặt may"
              }
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              fullWidth
              size="large"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
