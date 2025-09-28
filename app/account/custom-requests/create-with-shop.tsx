import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../providers/auth.provider";
import { customRequestApi } from "../../../services/apis/custom-request.api";
import { orderApi } from "../../../services/apis/order.api";
import { shopApi } from "../../../services/apis/shop.api";
import { CustomRequestCreate } from "../../../services/types";
import { showMessage } from "../../../utils/message.util";

export default function CreateCustomRequestWithShopScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState<CustomRequestCreate>({
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
    status: "SUBMIT",
    isPrivate: false,
  });

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  React.useEffect(() => {
    if (shopId) {
      loadShopInfo();
    }
  }, [shopId]);

  const loadShopInfo = async () => {
    try {
      const shopData = await shopApi.getShopById(shopId);
      if (shopData && "item" in shopData && shopData.item) {
        setShop(shopData.item);
      } else if (shopData && "id" in shopData) {
        setShop(shopData);
      }
    } catch (error) {
      console.error("Error loading shop info:", error);
      showMessage("ERM006", "Không thể tải thông tin shop");
    }
  };

  const updateFormData = (field: keyof CustomRequestCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[`form_${field}`]) {
      setValidationErrors((prev) => ({ ...prev, [`form_${field}`]: "" }));
    }
    if (
      [
        "height",
        "weight",
        "bust",
        "waist",
        "hip",
        "neck",
        "shoulderWidth",
        "sleeveLength",
      ].includes(field)
    ) {
      const measurementError = validateMeasurementField(field, value);
      if (measurementError) {
        setValidationErrors((prev) => ({ ...prev, [field]: measurementError }));
      } else {
        setValidationErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const updateCustomerInfo = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case "phone":
        if (!value.trim()) return "Số điện thoại là bắt buộc";
        if (!value.trim().match(/^(\+84|84|0)[0-9]{9}$/)) {
          return "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam";
        }
        return null;

      case "email":
        if (!value.trim()) return "Email là bắt buộc";
        if (!value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return "Email không hợp lệ. Vui lòng nhập đúng định dạng email";
        }
        return null;

      case "address":
        if (!value.trim()) return "Địa chỉ giao hàng là bắt buộc";
        if (value.trim().length < 10) return "Địa chỉ phải có ít nhất 10 ký tự";
        return null;

      case "title":
        if (!value.trim()) return "Tiêu đề yêu cầu là bắt buộc";
        if (value.trim().length < 5)
          return "Tiêu đề yêu cầu phải có ít nhất 5 ký tự";
        return null;

      case "description":
        if (!value.trim()) return "Mô tả chi tiết là bắt buộc";
        if (value.trim().length < 20)
          return "Mô tả chi tiết phải có ít nhất 20 ký tự";
        return null;

      default:
        return null;
    }
  };

  const validateMeasurementField = (
    field: string,
    value: number
  ): string | null => {
    const ranges: {
      [key: string]: { min: number; max: number; unit: string };
    } = {
      height: { min: 1, max: 250, unit: "cm" },
      weight: { min: 1, max: 200, unit: "kg" },
      bust: { min: 1, max: 200, unit: "cm" },
      waist: { min: 1, max: 150, unit: "cm" },
      hip: { min: 1, max: 200, unit: "cm" },
      neck: { min: 1, max: 50, unit: "cm" },
      shoulderWidth: { min: 1, max: 80, unit: "cm" },
      sleeveLength: { min: 1, max: 100, unit: "cm" },
    };

    const range = ranges[field];
    if (!range) return null;

    if (value <= 0 || value > range.max) {
      return `${
        field === "height"
          ? "Chiều cao"
          : field === "weight"
            ? "Cân nặng"
            : field === "bust"
              ? "Vòng ngực"
              : field === "waist"
                ? "Vòng eo"
                : field === "hip"
                  ? "Vòng hông"
                  : field === "neck"
                    ? "Vòng cổ"
                    : field === "shoulderWidth"
                      ? "Vai"
                      : field === "sleeveLength"
                        ? "Tay áo"
                        : field
      } phải từ ${range.min} đến ${range.max} ${range.unit}`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate customer info
    const phoneError = validateField("phone", customerInfo.phone);
    if (phoneError) errors.phone = phoneError;

    const emailError = validateField("email", customerInfo.email);
    if (emailError) errors.email = emailError;

    const addressError = validateField("address", customerInfo.address);
    if (addressError) errors.address = addressError;

    // Validate request info
    const titleError = validateField("title", formData.title);
    if (titleError) errors.title = titleError;

    const descriptionError = validateField("description", formData.description);
    if (descriptionError) errors.description = descriptionError;

    // Validate body measurements
    const heightError = validateMeasurementField("height", formData.height);
    if (heightError) errors.height = heightError;

    const weightError = validateMeasurementField("weight", formData.weight);
    if (weightError) errors.weight = weightError;

    const bustError = validateMeasurementField("bust", formData.bust);
    if (bustError) errors.bust = bustError;

    const waistError = validateMeasurementField("waist", formData.waist);
    if (waistError) errors.waist = waistError;

    const hipError = validateMeasurementField("hip", formData.hip);
    if (hipError) errors.hip = hipError;

    const neckError = validateMeasurementField("neck", formData.neck);
    if (neckError) errors.neck = neckError;

    const shoulderError = validateMeasurementField(
      "shoulderWidth",
      formData.shoulderWidth
    );
    if (shoulderError) errors.shoulderWidth = shoulderError;

    const sleeveError = validateMeasurementField(
      "sleeveLength",
      formData.sleeveLength
    );
    if (sleeveError) errors.sleeveLength = sleeveError;

    // Set validation errors
    setValidationErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      showMessage("ERM001", "Vui lòng kiểm tra và sửa các lỗi trong form");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Step 1: Create custom request
      showMessage("INF001", "Đang tạo yêu cầu đặt may...");
      const requestResponse = await customRequestApi.createRequest(formData);
      const requestId = requestResponse.item.id;

      showMessage("SUC001", "Tạo yêu cầu thành công! Đang tạo đơn hàng...");

      // Step 2: Create custom order with shop
      const orderData = {
        phone: customerInfo.phone,
        email: customerInfo.email,
        address: customerInfo.address,
        requestId: requestId,
        shopId: shopId,
      };

      const orderResponse = await orderApi.createCustomOrder(orderData);

      if (orderResponse.success) {
        showMessage(
          "SUC001",
          "Đặt may thành công! Shop sẽ liên hệ với bạn sớm nhất."
        );

        // Reset form after success
        setFormData({
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
          status: "SUBMIT",
          isPrivate: false,
        });

        setCustomerInfo({
          phone: user?.phone || "",
          email: user?.email || "",
          address: user?.address || "",
        });

        if (
          orderResponse.orderNumber &&
          orderResponse.orderNumber !== "CUSTOM_ORDER_SUCCESS"
        ) {
          router.push(`/account/orders/${orderResponse.orderNumber}` as any);
        } else {
          router.push("/account/orders" as any);
        }
      } else {
        showMessage(
          "ERM006",
          orderResponse.message ||
            "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại."
        );
      }
    } catch (error: any) {
      console.error("Error creating custom request with shop:", error);

      if (error.message?.includes("network")) {
        showMessage(
          "ERM006",
          "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại."
        );
      } else if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("401")
      ) {
        showMessage(
          "SSM001",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (error.message?.includes("validation")) {
        showMessage(
          "ERM001",
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
        );
      } else {
        showMessage(
          "ERM006",
          error.message || "Có lỗi xảy ra khi đặt may. Vui lòng thử lại sau."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!shop) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-base text-gray-600">
          Đang tải thông tin shop...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-20 pb-4 px-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-primary-600 flex-1 text-center mx-4">
          Đặt may với {shop.name}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Shop Info */}
        <View className="p-6 bg-gray-50">
          <View className="flex-row items-center">
            <Image
              source={{
                uri:
                  shop.logoUrl || "https://via.placeholder.com/60x60?text=Logo",
              }}
              className="w-16 h-16 rounded-full bg-gray-100 mr-4"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800 mb-1">
                {shop.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-2">{shop.address}</Text>
              <Text className="text-sm text-primary-600 font-medium">
                Đặt may trực tiếp với shop
              </Text>
            </View>
          </View>
        </View>

        <View className="p-6">
          {/* Customer Information */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Thông tin liên hệ
            </Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  value={customerInfo.phone}
                  onChangeText={(value) => updateCustomerInfo("phone", value)}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                />
                {validationErrors.phone && (
                  <Text className="text-red-500 text-xs mt-1">
                    {validationErrors.phone}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  value={customerInfo.email}
                  onChangeText={(value) => updateCustomerInfo("email", value)}
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {validationErrors.email && (
                  <Text className="text-red-500 text-xs mt-1">
                    {validationErrors.email}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  value={customerInfo.address}
                  onChangeText={(value) => updateCustomerInfo("address", value)}
                  placeholder="Nhập địa chỉ giao hàng"
                  multiline
                  numberOfLines={3}
                />
                {validationErrors.address && (
                  <Text className="text-red-500 text-xs mt-1">
                    {validationErrors.address}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Request Information */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Thông tin yêu cầu đặt may
            </Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề yêu cầu *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  value={formData.title}
                  onChangeText={(value) => updateFormData("title", value)}
                  placeholder="Ví dụ: Váy cưới dáng A, Váy dạ hội dài..."
                />
                {validationErrors.title && (
                  <Text className="text-red-500 text-xs mt-1">
                    {validationErrors.title}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết *
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                  value={formData.description}
                  onChangeText={(value) => updateFormData("description", value)}
                  placeholder="Mô tả chi tiết về váy bạn muốn đặt may..."
                  multiline
                  numberOfLines={4}
                />
                {validationErrors.description && (
                  <Text className="text-red-500 text-xs mt-1">
                    {validationErrors.description}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Body Measurements */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Số đo cơ thể
            </Text>
            <View className="space-y-4">
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Chiều cao (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.height.toString()}
                    onChangeText={(value) =>
                      updateFormData("height", Number(value) || 0)
                    }
                    placeholder="160"
                    keyboardType="numeric"
                  />
                  {validationErrors.height && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.height}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Cân nặng (kg)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.weight.toString()}
                    onChangeText={(value) =>
                      updateFormData("weight", Number(value) || 0)
                    }
                    placeholder="55"
                    keyboardType="numeric"
                  />
                  {validationErrors.weight && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.weight}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Vòng ngực (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.bust.toString()}
                    onChangeText={(value) =>
                      updateFormData("bust", Number(value) || 0)
                    }
                    placeholder="85"
                    keyboardType="numeric"
                  />
                  {validationErrors.bust && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.bust}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Vòng eo (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.waist.toString()}
                    onChangeText={(value) =>
                      updateFormData("waist", Number(value) || 0)
                    }
                    placeholder="65"
                    keyboardType="numeric"
                  />
                  {validationErrors.waist && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.waist}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Vòng hông (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.hip.toString()}
                    onChangeText={(value) =>
                      updateFormData("hip", Number(value) || 0)
                    }
                    placeholder="90"
                    keyboardType="numeric"
                  />
                  {validationErrors.hip && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.hip}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Vòng cổ (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.neck.toString()}
                    onChangeText={(value) =>
                      updateFormData("neck", Number(value) || 0)
                    }
                    placeholder="35"
                    keyboardType="numeric"
                  />
                  {validationErrors.neck && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.neck}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Vai (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.shoulderWidth.toString()}
                    onChangeText={(value) =>
                      updateFormData("shoulderWidth", Number(value) || 0)
                    }
                    placeholder="38"
                    keyboardType="numeric"
                  />
                  {validationErrors.shoulderWidth && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.shoulderWidth}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Tay áo (cm)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    value={formData.sleeveLength.toString()}
                    onChangeText={(value) =>
                      updateFormData("sleeveLength", Number(value) || 0)
                    }
                    placeholder="60"
                    keyboardType="numeric"
                  />
                  {validationErrors.sleeveLength && (
                    <Text className="text-red-500 text-xs mt-1">
                      {validationErrors.sleeveLength}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`w-full py-4 rounded-2xl items-center ${
              loading ? "bg-gray-400" : "bg-primary-500"
            }`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text className="text-white font-semibold text-lg">
                Đang xử lý...
              </Text>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Đặt may ngay
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-sm text-gray-500 text-center mt-4">
            Shop sẽ liên hệ với bạn để xác nhận và báo giá chi tiết
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
