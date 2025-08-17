import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/Button";
import Card from "../../components/Card";
import DatePicker from "../../components/DatePicker";
import Input from "../../components/Input";
import { LightStatusBar } from "../../components/StatusBar";
import { useAuth } from "../../providers/auth.provider";
import { dressApi } from "../../services/apis/dress.api";
import {
  AccessoryDetail,
  CreateOrderRequest,
  DressDetails,
  orderApi,
} from "../../services/apis/order.api";
import { shopApi } from "../../services/apis/shop.api";
import { Accessory } from "../../services/types";
import { Dress } from "../../services/types/dress.type";
import { formatVNDCustom } from "../../utils/currency.util";

interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function CheckoutScreen() {
  const { dressId, type = "SELL" } = useLocalSearchParams<{
    dressId: string;
    type: string;
  }>();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dress, setDress] = useState<Dress | null>(null);
  const [shopAccessories, setShopAccessories] = useState<Accessory[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<
    AccessoryDetail[]
  >([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"delivery" | "return">(
    "delivery"
  );

  // Form data
  const [orderData, setOrderData] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    dueDate: "",
    returnDate: null,
  });

  const [measurements, setMeasurements] = useState<DressDetails>({
    dressId: dressId || "",
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
  });

  const steps: CheckoutStep[] = [
    {
      id: "customer-info",
      title: "Thông tin khách hàng",
      description: "Xác nhận thông tin liên hệ và địa chỉ",
      isCompleted: false,
    },
    {
      id: "measurements",
      title: "Số đo cơ thể",
      description: "Nhập số đo để may váy vừa vặn",
      isCompleted: false,
    },
    {
      id: "accessories",
      title: "Phụ kiện đi kèm",
      description: "Chọn phụ kiện bổ sung cho váy",
      isCompleted: false,
    },
    {
      id: "confirmation",
      title: "Xác nhận đơn hàng",
      description: "Kiểm tra và xác nhận thông tin cuối cùng",
      isCompleted: false,
    },
  ];

  const loadDressDetails = useCallback(async () => {
    try {
      setLoading(true);
      const dressData = await dressApi.getDressById(dressId);
      setDress(dressData);

      // Load accessories from the shop if dress has shop info
      if (dressData.user?.shop?.id) {
        await loadShopAccessories(dressData.user.shop.id);
      }
    } catch (error) {
      console.error("Error loading dress details:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin váy",
      });
    } finally {
      setLoading(false);
    }
  }, [dressId]);

  useEffect(() => {
    if (dressId) {
      loadDressDetails();
    }
  }, [dressId, loadDressDetails]);

  useEffect(() => {
    if (user?.address) {
      setOrderData((prev) => ({
        ...prev,
        address: user.address || "",
      }));
    }
  }, [user]);

  const loadShopAccessories = async (shopId: string) => {
    try {
      const response = await shopApi.getShopAccessories(shopId, 0, 50);
      setShopAccessories(response.items || []);
    } catch (error) {
      console.error("Error loading shop accessories:", error);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!dress) return 0;

    let total = 0;

    // Add dress price
    if (type === "SELL" && dress.sellPrice) {
      total += parseFloat(dress.sellPrice);
    } else if (type === "RENT" && dress.rentalPrice) {
      total += parseFloat(dress.rentalPrice);
    }

    // Add accessories price
    selectedAccessories.forEach((selected) => {
      const accessory = shopAccessories.find(
        (a) => a.id === selected.accessoryId
      );
      if (accessory) {
        if (type === "SELL" && accessory.sellPrice) {
          total += parseFloat(accessory.sellPrice) * selected.quantity;
        } else if (type === "RENT" && accessory.rentalPrice) {
          total += parseFloat(accessory.rentalPrice) * selected.quantity;
        }
      }
    });

    return total;
  };

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories((prev) => {
      const existing = prev.find((item) => item.accessoryId === accessoryId);
      if (existing) {
        return prev.filter((item) => item.accessoryId !== accessoryId);
      } else {
        return [...prev, { accessoryId, quantity: 1 }];
      }
    });
  };

  const updateAccessoryQuantity = (accessoryId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedAccessories((prev) =>
        prev.filter((item) => item.accessoryId !== accessoryId)
      );
      return;
    }

    setSelectedAccessories((prev) =>
      prev.map((item) =>
        item.accessoryId === accessoryId ? { ...item, quantity } : item
      )
    );
  };

  const updateOrderData = (field: string, value: string) => {
    setOrderData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMeasurement = (field: keyof DressDetails, value: number) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Customer info
        return !!(orderData.phone && orderData.email && orderData.address);
      case 1: // Measurements
        return !!(
          measurements.height &&
          measurements.bust &&
          measurements.waist &&
          measurements.hip
        );
      case 2: // Accessories (optional)
        return true;
      case 3: // Confirmation
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        // Mark current step as completed
        steps[currentStep].isCompleted = true;
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Thông tin không đầy đủ",
        text2: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    if (datePickerMode === "delivery") {
      updateOrderData("dueDate", formattedDate);
    } else if (datePickerMode === "return") {
      updateOrderData("returnDate", formattedDate);
    }
  };

  const openDatePicker = (mode: "delivery" | "return") => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);

      const orderRequest: CreateOrderRequest = {
        newOrder: {
          phone: orderData.phone,
          email: orderData.email,
          address: orderData.address,
          dueDate: orderData.dueDate ?? undefined,
          returnDate: type === "RENT" ? (orderData.returnDate ?? undefined) : "",
          type: type as "SELL" | "RENT",
        },
        dressDetails: measurements,
        accessoriesDetails: selectedAccessories,
      };

      const result = await orderApi.createOrder(orderRequest);

      Toast.show({
        type: "success",
        text1: "Đặt hàng thành công!",
        text2: `Mã đơn hàng: ${result.orderNumber}`,
      });

      // Navigate to order confirmation
      router.push("/account/orders" as any);
    } catch (error) {
      console.error("Error creating order:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi đặt hàng",
        text2: "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        {steps.map((step, index) => (
          <View key={step.id} className="flex-1 items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                index <= currentStep ? "bg-primary-500" : "bg-gray-200"
              }`}
            >
              {step.isCompleted ? (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              ) : (
                <Text
                  className={`text-sm font-semibold ${
                    index <= currentStep ? "text-white" : "text-gray-500"
                  }`}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              className={`text-xs text-center mt-2 ${
                index <= currentStep ? "text-primary-600" : "text-gray-400"
              }`}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-gray-200 rounded-full">
        <View
          className="h-1 bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </View>
    </View>
  );

  const renderCustomerInfoStep = () => (
    <Card className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Thông tin khách hàng
      </Text>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Số điện thoại <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={orderData.phone}
            onChangeText={(text: string) => updateOrderData("phone", text)}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Email <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={orderData.email}
            onChangeText={(text: string) => updateOrderData("email", text)}
            placeholder="Nhập email"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Địa chỉ giao hàng <Text className="text-red-500">*</Text>
          </Text>
          <Input
            value={orderData.address}
            onChangeText={(text: string) => updateOrderData("address", text)}
            placeholder="Nhập địa chỉ chi tiết"
            multiline
            numberOfLines={3}
          />
          {user?.address && (
            <View className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Text className="text-sm font-medium text-blue-800 mb-2">
                Địa chỉ từ hồ sơ:
              </Text>
              <Text className="text-sm text-blue-700">{user.address}</Text>
              <TouchableOpacity
                onPress={() => updateOrderData("address", user.address || "")}
                className="mt-2"
              >
                <Text className="text-sm text-blue-600 font-medium">
                  Sử dụng địa chỉ này
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Ngày giao hàng
            </Text>
            <TouchableOpacity
              onPress={() => openDatePicker("delivery")}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <Text
                className={
                  orderData.dueDate ? "text-gray-900" : "text-gray-500"
                }
              >
                {orderData.dueDate || "Chọn ngày giao hàng"}
              </Text>
            </TouchableOpacity>
          </View>

          {type === "RENT" && (
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Ngày trả hàng
              </Text>
              <TouchableOpacity
                onPress={() => openDatePicker("return")}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <Text
                  className={
                    orderData.returnDate ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {orderData.returnDate || "Chọn ngày trả hàng"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order Type Display */}
        <View className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <View className="flex-row items-center">
            <Ionicons
              name={type === "SELL" ? "shirt" : "repeat"}
              size={20}
              color={type === "SELL" ? "#E05C78" : "#10B981"}
            />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              Loại đơn hàng: {type === "SELL" ? "Mua váy" : "Thuê váy"}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderMeasurementsStep = () => (
    <Card className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Số đo cơ thể (cm)
      </Text>

      <View className="space-y-4">
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Chiều cao <Text className="text-red-500">*</Text>
            </Text>
            <Input
              value={measurements.height.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("height", Number(text) || 0)
              }
              placeholder="165"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Cân nặng (kg)
            </Text>
            <Input
              value={measurements.weight.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("weight", Number(text) || 0)
              }
              placeholder="50"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Vòng ngực <Text className="text-red-500">*</Text>
            </Text>
            <Input
              value={measurements.bust.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("bust", Number(text) || 0)
              }
              placeholder="85"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Vòng eo <Text className="text-red-500">*</Text>
            </Text>
            <Input
              value={measurements.waist.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("waist", Number(text) || 0)
              }
              placeholder="65"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Vòng mông <Text className="text-red-500">*</Text>
            </Text>
            <Input
              value={measurements.hip.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("hip", Number(text) || 0)
              }
              placeholder="90"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Vòng cổ
            </Text>
            <Input
              value={measurements.neck.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("neck", Number(text) || 0)
              }
              placeholder="20"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Vai</Text>
            <Input
              value={measurements.shoulderWidth.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("shoulderWidth", Number(text) || 0)
              }
              placeholder="40"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Tay áo
            </Text>
            <Input
              value={measurements.sleeveLength.toString()}
              onChangeText={(text: string) =>
                updateMeasurement("sleeveLength", Number(text) || 0)
              }
              placeholder="40"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderAccessoriesStep = () => (
    <Card className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Phụ kiện đi kèm
      </Text>

      {shopAccessories.length === 0 ? (
        <View className="py-8 items-center">
          <Ionicons name="bag-outline" size={48} color="#CCCCCC" />
          <Text className="text-gray-400 text-center mt-4">
            Không có phụ kiện nào cho váy này
          </Text>
          <Text className="text-gray-400 text-center mt-2 text-sm">
            Shop này chưa cung cấp phụ kiện
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
          {shopAccessories.map((accessory) => {
            const isSelected = selectedAccessories.some(
              (item) => item.accessoryId === accessory.id
            );
            const selectedItem = selectedAccessories.find(
              (item) => item.accessoryId === accessory.id
            );
            const quantity = selectedItem?.quantity || 0;

            return (
              <View
                key={accessory.id}
                className={`p-3 rounded-lg border-2 ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">
                      {accessory.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {type === "SELL"
                        ? formatVNDCustom(accessory.sellPrice, "₫")
                        : formatVNDCustom(accessory.rentalPrice, "₫")}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleAccessory(accessory.id)}
                    className={`px-4 py-2 rounded-lg ${
                      isSelected ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {isSelected ? "Đã chọn" : "Chọn"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isSelected && (
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">Số lượng:</Text>
                    <View className="flex-row items-center space-x-3">
                      <TouchableOpacity
                        onPress={() =>
                          updateAccessoryQuantity(accessory.id, quantity - 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                      >
                        <Ionicons name="remove" size={16} color="#666" />
                      </TouchableOpacity>

                      <Text className="text-lg font-medium text-gray-800 min-w-[30px] text-center">
                        {quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          updateAccessoryQuantity(accessory.id, quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center"
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {selectedAccessories.length > 0 && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="text-sm font-medium text-blue-800 mb-2">
            Phụ kiện đã chọn:
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
                className="flex-row justify-between items-center"
              >
                <Text className="text-sm text-blue-700">
                  {accessory.name} x{selected.quantity}
                </Text>
                <Text className="text-sm font-medium text-blue-800">
                  {formatVNDCustom(totalPrice, "₫")}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );

  const renderConfirmationStep = () => (
    <Card className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        Xác nhận đơn hàng
      </Text>

      <View className="space-y-4">
        {/* Dress Info */}
        {dress && (
          <View className="p-3 bg-gray-50 rounded-lg">
            <Text className="font-semibold text-gray-800 mb-2">
              Thông tin váy
            </Text>
            <Text className="text-gray-600">{dress.name}</Text>
            <Text className="text-primary-600 font-semibold">
              {type === "SELL"
                ? formatVNDCustom(dress.sellPrice, "₫")
                : formatVNDCustom(dress.rentalPrice, "₫")}
            </Text>
          </View>
        )}

        {/* Accessories Info */}
        {selectedAccessories.length > 0 && (
          <View className="p-3 bg-gray-50 rounded-lg">
            <Text className="font-semibold text-gray-800 mb-2">
              Phụ kiện đã chọn
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
                  className="flex-row justify-between items-center mb-1"
                >
                  <Text className="text-gray-600">
                    {accessory.name} x{selected.quantity}
                  </Text>
                  <Text className="text-gray-800 font-medium">
                    {formatVNDCustom(totalPrice, "₫")}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Customer Info */}
        <View className="p-3 bg-gray-50 rounded-lg">
          <Text className="font-semibold text-gray-800 mb-2">
            Thông tin khách hàng
          </Text>
          <Text className="text-gray-600">SĐT: {orderData.phone}</Text>
          <Text className="text-gray-600">Email: {orderData.email}</Text>
          <Text className="text-gray-600">Địa chỉ: {orderData.address}</Text>
          {orderData.dueDate && (
            <Text className="text-gray-600">
              Ngày giao: {orderData.dueDate}
            </Text>
          )}
          {type === "RENT" && orderData.returnDate && (
            <Text className="text-gray-600">
              Ngày trả: {orderData.returnDate}
            </Text>
          )}
        </View>

        {/* Order Type */}
        <View className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <Text className="font-semibold text-primary-800 mb-2">
            Loại đơn hàng: {type === "SELL" ? "Mua váy" : "Thuê váy"}
          </Text>
          <Text className="text-primary-600">
            {type === "SELL"
              ? "Bạn sẽ sở hữu váy này vĩnh viễn"
              : "Bạn sẽ thuê váy trong thời gian nhất định"}
          </Text>
        </View>

        {/* Total */}
        <View className="p-3 bg-primary-50 rounded-lg border border-primary-200">
          <Text className="font-semibold text-primary-800 mb-2">Tổng cộng</Text>
          <Text className="text-primary-600 font-bold text-lg">
            {formatVNDCustom(calculateTotalPrice(), "₫")}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderCustomerInfoStep();
      case 1:
        return renderMeasurementsStep();
      case 2:
        return renderAccessoriesStep();
      case 3:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => (
    <View className="flex-row space-x-3 mt-6">
      {currentStep > 0 && (
        <View className="flex-1">
          <Button
            title="Quay lại"
            onPress={prevStep}
            variant="outline"
            fullWidth
          />
        </View>
      )}

      <View className="flex-1">
        {currentStep === steps.length - 1 ? (
          <Button
            title="Đặt hàng"
            onPress={handleCreateOrder}
            loading={loading}
            fullWidth
          />
        ) : (
          <Button title="Tiếp tục" onPress={nextStep} fullWidth />
        )}
      </View>
    </View>
  );

  if (!dressId) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LightStatusBar />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-800 mt-4">
            Không tìm thấy thông tin váy
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Vui lòng quay lại trang chi tiết váy để đặt hàng
          </Text>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            className="mt-6"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LightStatusBar />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            {type === "SELL" ? "Mua váy" : "Thuê váy"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        {renderNavigationButtons()}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateSelect}
        title={
          datePickerMode === "delivery"
            ? "Chọn ngày giao hàng"
            : "Chọn ngày trả hàng"
        }
        minimumDate={
          datePickerMode === "return" && orderData.dueDate
            ? new Date(orderData.dueDate)
            : new Date()
        }
        initialDate={
          datePickerMode === "return" && orderData.dueDate
            ? new Date(orderData.dueDate)
            : new Date()
        }
      />
    </SafeAreaView>
  );
}
