import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../providers/auth.provider";
import { dressApi } from "../../services/apis/dress.api";
import { orderApi } from "../../services/apis/order.api";
import { Dress } from "../../services/types";
import { showMessage } from "../../utils/message.util";

interface OrderData {
  dressId: string;
  type: "SELL" | "RENT" | "CUSTOM";
  dueDate: string;
  returnDate: string;
  note: string;
  measurements: {
    bust: string;
    waist: string;
    hip: string;
    shoulder: string;
    armLength: string;
    backLength: string;
    lowerWaist: string;
    armpit: string;
    bicep: string;
    waistToFloor: string;
    neck: string;
    inseam: string;
    height: string;
  };
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [dress, setDress] = useState<Dress | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    dressId: "",
    type: "SELL",
    dueDate: "",
    returnDate: "",
    note: "",
    measurements: {
      bust: "",
      waist: "",
      hip: "",
      shoulder: "",
      armLength: "",
      backLength: "",
      lowerWaist: "",
      armpit: "",
      bicep: "",
      waistToFloor: "",
      neck: "",
      inseam: "",
      height: "",
    },
  });

  useEffect(() => {
    if (params.dressId) {
      loadDress(params.dressId as string);
      setOrderData((prev) => ({ ...prev, dressId: params.dressId as string }));
    }
    if (params.type) {
      setOrderData((prev) => ({
        ...prev,
        type: params.type as "SELL" | "RENT" | "CUSTOM",
      }));
    }
  }, [params]);

  const loadDress = async (dressId: string) => {
    try {
      setLoading(true);
      const dress = await dressApi.getDressById(dressId);
      setDress(dress);
    } catch (error) {
      console.error("Error loading dress:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin váy",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number, showToast: boolean = true): boolean => {
    switch (step) {
      case 1:
        // Kiểm tra thông tin cơ bản
        if (!orderData.dueDate || orderData.dueDate.trim() === "") {
          if (showToast) {
            Toast.show({
              type: "error",
              text1: "Lỗi",
              text2: "Vui lòng nhập ngày cần giao hàng",
              visibilityTime: 3000,
            });
          }
          return false;
        }

        // Kiểm tra ngày hợp lệ
        const dueDate = new Date(orderData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          if (showToast) {
            Toast.show({
              type: "error",
              text1: "Lỗi",
              text2: "Ngày giao hàng không thể là ngày trong quá khứ",
              visibilityTime: 3000,
            });
          }
          return false;
        }

        // Kiểm tra ngày trả hàng nếu là thuê
        if (orderData.type === "RENT") {
          if (!orderData.returnDate || orderData.returnDate.trim() === "") {
            if (showToast) {
              Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Vui lòng nhập ngày trả hàng",
                visibilityTime: 3000,
              });
            }
            return false;
          }

          const returnDate = new Date(orderData.returnDate);
          if (returnDate <= dueDate) {
            if (showToast) {
              Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Ngày trả hàng phải sau ngày giao hàng",
                visibilityTime: 3000,
              });
            }
            return false;
          }
        }

        return true;

      case 2:
        // Kiểm tra tất cả số đo đã được nhập
        const requiredMeasurements = [
          "bust",
          "waist",
          "hip",
          "shoulder",
          "armLength",
          "backLength",
          "lowerWaist",
          "armpit",
          "bicep",
          "waistToFloor",
          "neck",
          "inseam",
          "height",
        ];

        const missingMeasurements = requiredMeasurements.filter(
          (field) =>
            !orderData.measurements[
              field as keyof typeof orderData.measurements
            ] ||
            orderData.measurements[
              field as keyof typeof orderData.measurements
            ].trim() === ""
        );

        if (missingMeasurements.length > 0) {
          if (showToast) {
            const fieldNames = {
              bust: "Vòng ngực",
              waist: "Vòng eo",
              hip: "Vòng mông",
              shoulder: "Vai",
              armLength: "Tay áo",
              backLength: "Lưng",
              lowerWaist: "Eo dưới",
              armpit: "Nách",
              bicep: "Bắp tay",
              waistToFloor: "Eo đến sàn",
              neck: "Cổ",
              inseam: "Đường may",
              height: "Chiều cao",
            };

            const missingNames = missingMeasurements
              .map((field) => fieldNames[field as keyof typeof fieldNames])
              .join(", ");

            Toast.show({
              type: "error",
              text1: "Thiếu thông tin",
              text2: `Vui lòng nhập đầy đủ: ${missingNames}`,
              visibilityTime: 4000,
            });
          }
          return false;
        }

        // Kiểm tra số đo hợp lệ (phải là số dương)
        const invalidMeasurements = requiredMeasurements.filter((field) => {
          const value = parseFloat(
            orderData.measurements[field as keyof typeof orderData.measurements]
          );
          return isNaN(value) || value <= 0;
        });

        if (invalidMeasurements.length > 0) {
          if (showToast) {
            Toast.show({
              type: "error",
              text1: "Số đo không hợp lệ",
              text2: "Tất cả số đo phải là số dương",
              visibilityTime: 3000,
            });
          }
          return false;
        }

        return true;

      case 3:
        return true;

      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep, true)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleCreateOrder = async () => {
    if (!user) {
      showMessage("ERM001");
      return;
    }

    // Kiểm tra validation cuối cùng trước khi tạo đơn hàng
    if (!validateStep(1, true) || !validateStep(2, true)) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng kiểm tra lại thông tin đơn hàng",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setOrderLoading(true);

      const orderRequest = {
        newOrder: {
          phone: user.phone || "",
          email: user.email || "",
          address: user.address || "",
          dueDate: orderData.dueDate,
          returnDate: orderData.returnDate || undefined,
          type: orderData.type,
        },
        dressDetails: {
          dressId: orderData.dressId,
          height: parseFloat(orderData.measurements.height) || 0,
          weight: 0, // Not provided in form
          bust: parseFloat(orderData.measurements.bust) || 0,
          waist: parseFloat(orderData.measurements.waist) || 0,
          hip: parseFloat(orderData.measurements.hip) || 0,
          armpit: parseFloat(orderData.measurements.armpit) || 0,
          bicep: parseFloat(orderData.measurements.bicep) || 0,
          neck: parseFloat(orderData.measurements.neck) || 0,
          shoulderWidth: parseFloat(orderData.measurements.shoulder) || 0,
          sleeveLength: parseFloat(orderData.measurements.armLength) || 0,
          backLength: parseFloat(orderData.measurements.backLength) || 0,
          lowerWaist: parseFloat(orderData.measurements.lowerWaist) || 0,
          waistToFloor: parseFloat(orderData.measurements.waistToFloor) || 0,
        },
        accessoriesDetails: [], // No accessories in this form
      };

      const response = await orderApi.createOrder(orderRequest);

      if (response.statusCode === 201) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã tạo đơn hàng thành công",
          visibilityTime: 3000,
        });

        // Navigate to success page
        router.push("/payment/success");
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: response.message || "Không thể tạo đơn hàng",
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tạo đơn hàng",
        visibilityTime: 3000,
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const renderCustomerInfoStep = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Thông tin đơn hàng
      </Text>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Loại đơn hàng
        </Text>
        <View className="flex-row space-x-2">
          {["SELL", "RENT", "CUSTOM"].map((type) => (
            <TouchableOpacity
              key={type}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                orderData.type === type
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300"
              }`}
              onPress={() =>
                setOrderData((prev) => ({ ...prev, type: type as any }))
              }
            >
              <Text
                className={`text-center font-medium ${
                  orderData.type === type ? "text-primary-600" : "text-gray-600"
                }`}
              >
                {type === "SELL" ? "Mua" : type === "RENT" ? "Thuê" : "Đặt may"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Ngày cần giao hàng <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className={`border-2 rounded-lg p-4 text-gray-800 ${
            orderData.dueDate ? "border-green-300" : "border-gray-300"
          }`}
          value={orderData.dueDate}
          onChangeText={(text) =>
            setOrderData((prev) => ({ ...prev, dueDate: text }))
          }
          placeholder="YYYY-MM-DD"
        />
        {!orderData.dueDate && (
          <Text className="text-red-500 text-xs mt-1">
            Vui lòng nhập ngày giao hàng
          </Text>
        )}
      </View>

      {orderData.type === "RENT" && (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Ngày trả hàng <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`border-2 rounded-lg p-4 text-gray-800 ${
              orderData.returnDate ? "border-green-300" : "border-gray-300"
            }`}
            value={orderData.returnDate}
            onChangeText={(text) =>
              setOrderData((prev) => ({ ...prev, returnDate: text }))
            }
            placeholder="YYYY-MM-DD"
          />
          {!orderData.returnDate && (
            <Text className="text-red-500 text-xs mt-1">
              Vui lòng nhập ngày trả hàng
            </Text>
          )}
          {orderData.returnDate &&
            orderData.dueDate &&
            (() => {
              const returnDate = new Date(orderData.returnDate);
              const dueDate = new Date(orderData.dueDate);
              if (returnDate <= dueDate) {
                return (
                  <Text className="text-red-500 text-xs mt-1">
                    Ngày trả hàng phải sau ngày giao hàng
                  </Text>
                );
              }
              return null;
            })()}
        </View>
      )}

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Ghi chú</Text>
        <TextInput
          className="border-2 border-gray-300 rounded-lg p-4 text-gray-800"
          value={orderData.note}
          onChangeText={(text) =>
            setOrderData((prev) => ({ ...prev, note: text }))
          }
          placeholder="Ghi chú cho đơn hàng"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderMeasurementsStep = () => {
    const renderMeasurementField = (
      field: keyof typeof orderData.measurements,
      label: string,
      placeholder: string = "0"
    ) => {
      const value = orderData.measurements[field];
      const isValid = value && parseFloat(value) > 0;

      return (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            {label} (cm) <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`border-2 rounded-lg p-3 text-gray-800 ${
              isValid ? "border-green-300" : "border-gray-300"
            }`}
            value={value}
            onChangeText={(text) =>
              setOrderData((prev) => ({
                ...prev,
                measurements: { ...prev.measurements, [field]: text },
              }))
            }
            placeholder={placeholder}
            keyboardType="numeric"
          />
          {!value && (
            <Text className="text-red-500 text-xs mt-1">
              Vui lòng nhập {label.toLowerCase()}
            </Text>
          )}
          {value && parseFloat(value) <= 0 && (
            <Text className="text-red-500 text-xs mt-1">
              {label} phải là số dương
            </Text>
          )}
        </View>
      );
    };

    return (
      <View className="space-y-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Số đo cơ thể
        </Text>

        <View className="grid grid-cols-2 gap-4">
          {renderMeasurementField("bust", "Vòng ngực", "0")}
          {renderMeasurementField("waist", "Vòng eo", "0")}
          {renderMeasurementField("hip", "Vòng mông", "0")}
          {renderMeasurementField("shoulder", "Vai", "0")}
          {renderMeasurementField("armLength", "Tay áo", "0")}
          {renderMeasurementField("backLength", "Lưng", "0")}
          {renderMeasurementField("lowerWaist", "Eo dưới", "0")}
          {renderMeasurementField("armpit", "Nách", "0")}
          {renderMeasurementField("bicep", "Bắp tay", "0")}
          {renderMeasurementField("waistToFloor", "Eo đến sàn", "0")}
          {renderMeasurementField("neck", "Cổ", "0")}
          {renderMeasurementField("inseam", "Đường may", "0")}
          {renderMeasurementField("height", "Chiều cao", "0")}
        </View>
      </View>
    );
  };

  const renderConfirmationStep = () => (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Xác nhận đơn hàng
      </Text>

      {dress && (
        <View className="bg-gray-50 rounded-lg p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Thông tin váy
          </Text>
          <View className="flex-row items-center">
            <Image
              source={{ uri: dress.images?.[0] || "" }}
              className="w-16 h-16 rounded-lg mr-3"
            />
            <View className="flex-1">
              <Text className="font-medium text-gray-800">{dress.name}</Text>
              <Text className="text-sm text-gray-600">{dress.description}</Text>
              <Text className="text-primary-600 font-semibold">
                {(dress.sellPrice || 0).toLocaleString("vi-VN")} VND
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Thông tin đơn hàng
        </Text>
        <View className="space-y-2">
          <Text className="text-sm text-gray-600">
            Loại:{" "}
            {orderData.type === "SELL"
              ? "Mua"
              : orderData.type === "RENT"
                ? "Thuê"
                : "Đặt may"}
          </Text>
          <Text className="text-sm text-gray-600">
            Ngày giao: {new Date(orderData.dueDate).toLocaleDateString("vi-VN")}
          </Text>
          {orderData.returnDate && (
            <Text className="text-sm text-gray-600">
              Ngày trả:{" "}
              {new Date(orderData.returnDate).toLocaleDateString("vi-VN")}
            </Text>
          )}
          {orderData.note && (
            <Text className="text-sm text-gray-600">
              Ghi chú: {orderData.note}
            </Text>
          )}
        </View>
      </View>

      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Số đo cơ thể
        </Text>
        <View className="grid grid-cols-2 gap-2">
          <Text className="text-sm text-gray-600">
            Vòng ngực: {orderData.measurements.bust} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Vòng eo: {orderData.measurements.waist} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Vòng mông: {orderData.measurements.hip} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Vai: {orderData.measurements.shoulder} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Tay áo: {orderData.measurements.armLength} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Lưng: {orderData.measurements.backLength} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Eo dưới: {orderData.measurements.lowerWaist} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Nách: {orderData.measurements.armpit} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Bắp tay: {orderData.measurements.bicep} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Eo đến sàn: {orderData.measurements.waistToFloor} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Cổ: {orderData.measurements.neck} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Đường may: {orderData.measurements.inseam} cm
          </Text>
          <Text className="text-sm text-gray-600">
            Chiều cao: {orderData.measurements.height} cm
          </Text>
        </View>
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

  if (!dress) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            Không tìm thấy thông tin váy
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
            Thanh toán
          </Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Progress Steps */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          {[1, 2, 3].map((step) => (
            <View key={step} className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  currentStep >= step ? "bg-primary-500" : "bg-gray-300"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    currentStep >= step ? "text-white" : "text-gray-600"
                  }`}
                >
                  {step}
                </Text>
              </View>
              {step < 3 && (
                <View
                  className={`w-12 h-1 mx-2 ${
                    currentStep > step ? "bg-primary-500" : "bg-gray-300"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-xs text-gray-500">Thông tin</Text>
          <Text className="text-xs text-gray-500">Số đo</Text>
          <Text className="text-xs text-gray-500">Xác nhận</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {currentStep === 1 && renderCustomerInfoStep()}
        {currentStep === 2 && renderMeasurementsStep()}
        {currentStep === 3 && renderConfirmationStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="bg-white px-6 py-4 border-t border-gray-100">
        <View className="flex-row space-x-4">
          {currentStep > 1 && (
            <TouchableOpacity
              className="flex-1 bg-gray-300 rounded-xl py-4 items-center"
              onPress={prevStep}
            >
              <Text className="text-gray-700 font-semibold">Quay lại</Text>
            </TouchableOpacity>
          )}

          {currentStep === 1 || currentStep === 2 ? (
            <TouchableOpacity
              className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
              onPress={nextStep}
              disabled={!validateStep(currentStep, false)}
            >
              <Text className="text-white font-semibold">Tiếp theo</Text>
            </TouchableOpacity>
          ) : currentStep === 3 ? (
            <TouchableOpacity
              className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
              onPress={handleCreateOrder}
              disabled={orderLoading}
            >
              {orderLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Tạo đơn hàng</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
