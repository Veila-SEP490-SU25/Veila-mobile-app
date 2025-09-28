import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Button from "../components/Button";
import CheckoutAccessories from "../components/CheckoutAccessories";
import CheckoutConfirmation from "../components/CheckoutConfirmation";
import CheckoutCustomerInfo from "../components/CheckoutCustomerInfo";
import CheckoutMeasurements from "../components/CheckoutMeasurements";
import CheckoutStatusModal from "../components/CheckoutStatusModal";
import DatePicker from "../components/DatePicker";
import { useAuth } from "../providers/auth.provider";
import { dressApi } from "../services/apis/dress.api";
import {
  AccessoryDetail,
  CreateOrderRequest,
  DressDetails,
  orderApi,
} from "../services/apis/order.api";
import { shopApi } from "../services/apis/shop.api";
import { Accessory } from "../services/types";
import { Dress } from "../services/types/dress.type";

interface CheckoutStep {
  id: string;
  title: string;
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useLocalSearchParams();

  const dressId = searchParams.dressId as string;
  const type = (searchParams.type as "SELL" | "RENT") || "SELL";
  const shopId = searchParams.shopId as string;

  // State management
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    status: "SUCCESS" | "PENDING_PAYMENT" | "INSUFFICIENT_BALANCE" | "ERROR";
    orderNumber?: string;
    message?: string;
  }>({ status: "SUCCESS" });

  const [orderData, setOrderData] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    dueDate: null as string | null,
    returnDate: null as string | null,
  });

  const [measurements, setMeasurements] = useState<DressDetails>({
    dressId: dressId || "",
    height: 160, // Số đo trung bình: 160cm
    weight: 55, // Số đo trung bình: 55kg
    bust: 85, // Số đo trung bình: 85cm
    waist: 70, // Số đo trung bình: 70cm
    hip: 90, // Số đo trung bình: 90cm
    armpit: 25, // Số đo trung bình: 25cm
    bicep: 25, // Số đo trung bình: 25cm
    neck: 35, // Số đo trung bình: 35cm
    shoulderWidth: 35, // Số đo trung bình: 35cm
    sleeveLength: 0, // Số đo trung bình: 0cm (không có tay áo)
    backLength: 45, // Số đo trung bình: 45cm
    lowerWaist: 15, // Số đo trung bình: 15cm
    waistToFloor: 0, // Số đo trung bình: 0cm (không cần thiết)
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Steps array
  const steps: CheckoutStep[] = [
    {
      id: "customer-info",
      title: "Thông tin khách hàng",
      description: "Xác nhận thông tin liên hệ và địa chỉ",
    },
    {
      id: "measurements",
      title: "Số đo cơ thể",
      description: "Nhập số đo để may váy vừa vặn",
    },
    {
      id: "accessories",
      title: "Phụ kiện đi kèm",
      description: "Chọn phụ kiện bổ sung cho váy",
    },
    {
      id: "confirmation",
      title: "Xác nhận đơn hàng",
      description: "Kiểm tra và xác nhận thông tin cuối cùng",
    },
  ];

  // Load dress details
  useEffect(() => {
    if (dressId) {
      const loadDress = async () => {
        try {
          setLoading(true);
          const response = await dressApi.getDressById(dressId);

          let dressData: Dress;
          if ("item" in response && response.item) {
            dressData = response.item as Dress;
          } else if ("id" in response && "name" in response) {
            dressData = response as Dress;
          } else {
            throw new Error("Invalid dress response structure");
          }

          setDress(dressData);
          let targetShopId = dressData.user?.shop?.id || shopId;

          if (targetShopId) {
            try {
              const accessoriesResponse = await shopApi.getShopAccessories(
                targetShopId,
                0,
                50
              );
              if (
                accessoriesResponse &&
                accessoriesResponse.items &&
                Array.isArray(accessoriesResponse.items)
              ) {
                setShopAccessories(accessoriesResponse.items);
              } else {
                setShopAccessories([]);
              }
            } catch (error) {
              console.error("Error loading shop accessories:", error);
              setShopAccessories([]);
            }
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
      };

      // Reset form
      setCurrentStep(0);

      // Tính ngày giao mặc định: ngày hiện tại + 3 ngày
      const defaultDeliveryDate = new Date();
      defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 3);
      defaultDeliveryDate.setHours(12, 0, 0, 0);
      const formattedDeliveryDate = `${defaultDeliveryDate.getFullYear()}-${String(
        defaultDeliveryDate.getMonth() + 1
      ).padStart(2, "0")}-${String(defaultDeliveryDate.getDate()).padStart(
        2,
        "0"
      )}`;

      setOrderData({
        phone: user?.phone || "",
        email: user?.email || "",
        address: user?.address || "",
        dueDate: formattedDeliveryDate,
        returnDate: null,
      });
      setMeasurements({
        dressId: dressId || "",
        height: 160, // Số đo trung bình: 160cm
        weight: 55, // Số đo trung bình: 55kg
        bust: 85, // Số đo trung bình: 85cm
        waist: 70, // Số đo trung bình: 70cm
        hip: 90, // Số đo trung bình: 90cm
        armpit: 25, // Số đo trung bình: 25cm
        bicep: 25, // Số đo trung bình: 25cm
        neck: 35, // Số đo trung bình: 35cm
        shoulderWidth: 35, // Số đo trung bình: 35cm
        sleeveLength: 0, // Số đo trung bình: 0cm (không có tay áo)
        backLength: 45, // Số đo trung bình: 45cm
        lowerWaist: 15, // Số đo trung bình: 15cm
        waistToFloor: 0, // Số đo trung bình: 0cm (không cần thiết)
      });
      setSelectedAccessories([]);
      setValidationErrors({});

      // Load dress
      loadDress();
    }
  }, [dressId, user?.phone, user?.email, user?.address, shopId]);

  // Validation functions
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case "phone":
        if (!value) return "Số điện thoại là bắt buộc";
        const cleanPhone = value.replace(/\D/g, "");
        if (cleanPhone.length < 9) return "Số điện thoại quá ngắn";
        if (cleanPhone.length > 11) return "Số điện thoại quá dài";
        return null;

      case "email":
        if (!value) return "Email là bắt buộc";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Email không hợp lệ";
        return null;

      case "address":
        if (!value) return "Địa chỉ là bắt buộc";
        if (value.length < 10) return "Địa chỉ phải có ít nhất 10 ký tự";
        return null;

      case "dueDate":
        if (!value) return "Ngày giao hàng là bắt buộc";

        // Validate ngày giao cách ngày hiện tại ít nhất 3 ngày
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time về 00:00:00

        const minDeliveryDate = new Date(today);
        minDeliveryDate.setDate(today.getDate() + 3); // Thêm 3 ngày

        // Reset time của selectedDate để so sánh chính xác
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < minDeliveryDate) {
          return "Ngày giao hàng phải cách ngày hiện tại ít nhất 3 ngày";
        }
        return null;

      case "returnDate":
        if (type === "RENT" && !value)
          return "Ngày trả hàng là bắt buộc cho đơn hàng thuê";

        if (type === "RENT" && value && orderData.dueDate) {
          // Validate ngày trả cách ngày giao tối đa 6 ngày
          const deliveryDate = new Date(orderData.dueDate);
          const returnDate = new Date(value);

          // Reset time để so sánh chính xác
          deliveryDate.setHours(0, 0, 0, 0);
          returnDate.setHours(0, 0, 0, 0);

          const maxRentalDays = 6;
          const maxReturnDate = new Date(deliveryDate);
          maxReturnDate.setDate(deliveryDate.getDate() + maxRentalDays);

          if (returnDate > maxReturnDate) {
            return `Ngày trả hàng không được quá ${maxRentalDays} ngày sau ngày giao`;
          }

          if (returnDate <= deliveryDate) {
            return "Ngày trả hàng phải sau ngày giao hàng";
          }
        }
        return null;

      default:
        return null;
    }
  };

  const validateMeasurementField = (
    field: keyof DressDetails,
    value: number
  ): string | null => {
    if (field === "dressId") return null;

    const ranges: Record<
      keyof DressDetails,
      { min: number; max: number; unit: string }
    > = {
      dressId: { min: 0, max: 0, unit: "" },
      height: { min: 130, max: 200, unit: "cm" },
      weight: { min: 30, max: 100, unit: "kg" },
      bust: { min: 50, max: 150, unit: "cm" },
      waist: { min: 40, max: 100, unit: "cm" },
      hip: { min: 40, max: 150, unit: "cm" },
      armpit: { min: 10, max: 40, unit: "cm" },
      bicep: { min: 10, max: 40, unit: "cm" },
      neck: { min: 20, max: 50, unit: "cm" },
      shoulderWidth: { min: 20, max: 50, unit: "cm" },
      sleeveLength: { min: 0, max: 100, unit: "cm" },
      backLength: { min: 30, max: 60, unit: "cm" },
      lowerWaist: { min: 5, max: 30, unit: "cm" },
      waistToFloor: { min: 0, max: 200, unit: "cm" },
    };

    const range = ranges[field];
    if (!range) return null;

    if (value < range.min || value > range.max) {
      return `${field} phải từ ${range.min} đến ${range.max} ${range.unit}`;
    }

    return null;
  };

  // Update functions
  const updateOrderData = (field: string, value: string | null) => {
    console.log("updateOrderData called:", { field, value });
    setOrderData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));

    // Nếu thay đổi ngày giao, validate lại ngày trả
    if (field === "dueDate" && type === "RENT") {
      // Sử dụng giá trị mới của dueDate để validate
      const newOrderData = { ...orderData, [field]: value };
      if (newOrderData.returnDate) {
        const returnDateError = validateField(
          "returnDate",
          newOrderData.returnDate
        );
        if (returnDateError) {
          setValidationErrors((prev) => ({
            ...prev,
            returnDate: returnDateError,
          }));

          // Thông báo cho user biết ngày trả cần điều chỉnh
          Toast.show({
            type: "info",
            text1: "Thông báo",
            text2: "Ngày giao đã thay đổi, vui lòng kiểm tra lại ngày trả",
          });
        }
      }
    }
  };

  const updateMeasurement = (field: keyof DressDetails, value: number) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
    // Clear validation error
    setValidationErrors((prev) => ({
      ...prev,
      [`measurement_${String(field)}`]: "",
    }));
  };

  // Validation step function
  const validateStep = (stepIndex: number): boolean => {
    const errors: { [key: string]: string } = {};

    switch (stepIndex) {
      case 0:
        const phoneError = validateField("phone", orderData.phone);
        const emailError = validateField("email", orderData.email);
        const addressError = validateField("address", orderData.address);
        const dueDateError = validateField("dueDate", orderData.dueDate);

        // Chỉ validate returnDate nếu đã có dueDate
        let returnDateError = null;
        if (orderData.dueDate) {
          returnDateError = validateField("returnDate", orderData.returnDate);
        }

        if (phoneError) errors.phone = phoneError;
        if (emailError) errors.email = emailError;
        if (addressError) errors.address = addressError;
        if (dueDateError) errors.dueDate = dueDateError;
        if (returnDateError) errors.returnDate = returnDateError;
        break;

      case 1:
        const requiredFields: (keyof DressDetails)[] = [
          "height",
          "weight",
          "bust",
          "waist",
          "hip",
          "armpit",
          "bicep",
          "neck",
          "shoulderWidth",
          "backLength",
          "lowerWaist",
        ];

        requiredFields.forEach((field) => {
          const value = measurements[field];
          if (!value || Number(value) === 0) {
            errors[`measurement_${String(field)}`] =
              `${String(field)} là bắt buộc`;
          } else {
            const measurementError = validateMeasurementField(
              field,
              typeof value === "string" ? Number(value) : value
            );
            if (measurementError) {
              errors[`measurement_${String(field)}`] = measurementError;
            }
          }
        });

        // Validate sleeveLength và waistToFloor (có thể là 0)
        const optionalFields: (keyof DressDetails)[] = [
          "sleeveLength",
          "waistToFloor",
        ];
        optionalFields.forEach((field) => {
          const value = measurements[field];
          if (value !== undefined && value !== null) {
            const measurementError = validateMeasurementField(
              field,
              typeof value === "string" ? Number(value) : value
            );
            if (measurementError) {
              errors[`measurement_${String(field)}`] = measurementError;
            }
          }
        });
        break;

      case 2:
        break;

      case 3:
        break;

      default:
        return false;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (!validateStep(currentStep)) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng hoàn thành thông tin bước hiện tại",
        });
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Accessory functions
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

  // Date functions
  const handleDateSelect = (date: Date) => {
    console.log("handleDateSelect called with date:", date);
    // Đảm bảo ngày được xử lý chính xác
    const selectedDate = new Date(date);
    selectedDate.setHours(12, 0, 0, 0); // Đặt trưa để tránh lệch ngày do timezone

    const formattedDate = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    console.log("Formatted date:", formattedDate);

    if (datePickerMode === "delivery") {
      console.log("Updating dueDate:", formattedDate);
      updateOrderData("dueDate", formattedDate);

      // Nếu đang thuê váy và đã có ngày trả, kiểm tra xem ngày trả có hợp lệ không
      if (type === "RENT" && orderData.returnDate) {
        const returnDateError = validateField(
          "returnDate",
          orderData.returnDate
        );
        if (returnDateError) {
          // Nếu ngày trả không hợp lệ, xóa ngày trả
          updateOrderData("returnDate", null);
          Toast.show({
            type: "warning",
            text1: "Thông báo",
            text2: "Ngày trả đã bị xóa do không hợp lệ với ngày giao mới",
          });
        }
      }
    } else if (datePickerMode === "return") {
      console.log("Updating returnDate:", formattedDate);
      updateOrderData("returnDate", formattedDate);
    }
  };

  const openDatePicker = (mode: "delivery" | "return") => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  // Price calculation
  const calculateTotalPrice = () => {
    if (!dress) return 0;
    let total = 0;

    if (type === "SELL" && dress.sellPrice && dress.sellPrice !== "0") {
      const sellPrice = parseFloat(dress.sellPrice);
      if (!isNaN(sellPrice) && sellPrice > 0) {
        total += sellPrice;
      }
    } else if (
      type === "RENT" &&
      dress.rentalPrice &&
      dress.rentalPrice !== "0"
    ) {
      const rentalPrice = parseFloat(dress.rentalPrice);
      if (!isNaN(rentalPrice) && rentalPrice > 0) {
        total += rentalPrice;
      }
    }

    selectedAccessories.forEach((selected) => {
      const accessory = shopAccessories.find(
        (a) => a.id === selected.accessoryId
      );
      if (accessory) {
        if (
          type === "SELL" &&
          accessory.sellPrice &&
          accessory.sellPrice !== "0"
        ) {
          const price = parseFloat(accessory.sellPrice);
          if (!isNaN(price) && price > 0) {
            total += price * selected.quantity;
          }
        } else if (
          type === "RENT" &&
          accessory.rentalPrice &&
          accessory.rentalPrice !== "0"
        ) {
          const price = parseFloat(accessory.rentalPrice);
          if (!isNaN(price) && price > 0) {
            total += price * selected.quantity;
          }
        }
      }
    });

    return total;
  };

  // Create order function
  const handleCreateOrder = async () => {
    try {
      setLoading(true);

      // Validate lại tất cả trước khi tạo đơn hàng
      if (!validateStep(0)) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng hoàn thành thông tin bước 1",
        });
        setCurrentStep(0);
        setLoading(false);
        return;
      }

      if (!validateStep(1)) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng hoàn thành thông tin số đo bước 2",
        });
        setCurrentStep(1);
        setLoading(false);
        return;
      }

      const orderRequest: CreateOrderRequest = {
        newOrder: {
          phone: orderData.phone,
          email: orderData.email,
          address: orderData.address,
          dueDate: orderData.dueDate || new Date().toISOString().split("T")[0],
          type: type as "SELL" | "RENT",
          ...(type === "RENT" &&
            orderData.returnDate && {
              returnDate: orderData.returnDate,
            }),
        },
        dressDetails: measurements,
        accessoriesDetails: selectedAccessories,
      };

      const result = await orderApi.createOrder(orderRequest);

      if (result.success === false || result.statusCode >= 400) {
        const errorMessage = result.message || "Có lỗi xảy ra";

        if (
          errorMessage.includes("insufficient") ||
          errorMessage.includes("balance")
        ) {
          setCheckoutStatus({
            status: "INSUFFICIENT_BALANCE",
            message: errorMessage,
          });
        } else {
          setCheckoutStatus({ status: "ERROR", message: errorMessage });
        }
        setShowStatusModal(true);
        return;
      }

      // Kiểm tra orderNumber hợp lệ - có thể ở các field khác nhau
      let orderNumber =
        result.orderNumber ||
        result.orderId ||
        result.item?.id ||
        result.id ||
        result.number;

      if (
        !orderNumber ||
        orderNumber === "0" ||
        orderNumber === "" ||
        orderNumber === "ORDER_SUCCESS"
      ) {
        // Fallback: Tạo orderNumber từ timestamp nếu API không trả về
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        orderNumber = `ORDER_${timestamp}_${randomId}`;
      }

      setCheckoutStatus({
        status: "SUCCESS",
        orderNumber: orderNumber,
      });
      setShowStatusModal(true);
    } catch (error: any) {
      console.error("Error creating order:", error);
      setCheckoutStatus({
        status: "ERROR",
        message: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Status modal action handler
  const handleStatusModalAction = (action: string) => {
    switch (action) {
      case "VIEW_ORDER":
        if (
          checkoutStatus.orderNumber &&
          checkoutStatus.orderNumber !== "ORDER_SUCCESS"
        ) {
          // Sử dụng replace để thay thế checkout page, không thêm vào stack
          // Khi user nhấn back từ order detail, sẽ về trang trước checkout (ví dụ: dress detail)
          router.replace(`/account/orders/${checkoutStatus.orderNumber}`);
        } else {
          // Nếu không có orderNumber, chuyển về trang orders
          router.replace("/account/orders");
        }
        break;
      case "CONTINUE_SHOPPING":
        // Quay về trang trước đó (ví dụ: dress detail)
        router.back();
        break;
      case "TOPUP_WALLET":
        // Push để có thể back về checkout
        router.push("/account/wallet");
        break;
      case "VIEW_WALLET":
        // Push để có thể back về checkout
        router.push("/account/wallet");
        break;
      default:
        router.back();
    }
  };

  // Render functions
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CheckoutCustomerInfo
            orderData={orderData}
            type={type}
            validationErrors={validationErrors}
            onUpdateOrderData={updateOrderData}
            onOpenDatePicker={openDatePicker}
          />
        );
      case 1:
        return (
          <CheckoutMeasurements
            measurements={measurements}
            onUpdateMeasurement={updateMeasurement}
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <CheckoutAccessories
            shopAccessories={shopAccessories}
            selectedAccessories={selectedAccessories}
            type={type}
            dress={dress}
            onToggleAccessory={toggleAccessory}
            onUpdateAccessoryQuantity={updateAccessoryQuantity}
          />
        );
      case 3:
        return (
          <CheckoutConfirmation
            dress={dress}
            selectedAccessories={selectedAccessories}
            shopAccessories={shopAccessories}
            orderData={orderData}
            type={type}
            calculateTotalPrice={calculateTotalPrice}
          />
        );
      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepIndicatorRow}>
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted
                    ? styles.stepCircleCompleted
                    : isCurrent
                      ? styles.stepCircleCurrent
                      : styles.stepCircleDisabled,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent
                        ? styles.stepNumberActive
                        : styles.stepNumberDisabled,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  isCompleted
                    ? styles.stepTitleCompleted
                    : isCurrent
                      ? styles.stepTitleCurrent
                      : styles.stepTitleDisabled,
                ]}
              >
                {step.title}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <Text style={styles.progressText}>
        Bước {currentStep + 1} / {steps.length} -{" "}
        {Math.round(((currentStep + 1) / steps.length) * 100)}% hoàn thành
      </Text>
    </View>
  );

  const renderNavigationButtons = () => {
    const isLastStep = currentStep === steps.length - 1;

    return (
      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          {currentStep > 0 && (
            <View style={styles.buttonContainer}>
              <Button
                title="Quay lại"
                onPress={prevStep}
                variant="outline"
                fullWidth
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            {isLastStep ? (
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
      </View>
    );
  };

  if (loading && !dress) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thông tin váy...</Text>
      </View>
    );
  }

  if (!dress) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin váy</Text>
        <Button title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === "SELL" ? "Mua váy" : "Thuê váy"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepIndicator()}
        {renderCurrentStep()}
        {renderNavigationButtons()}
      </ScrollView>

      <DatePicker
        visible={showDatePicker}
        onClose={() => {
          console.log(
            "DatePicker onClose called, setting showDatePicker to false"
          );
          setShowDatePicker(false);
        }}
        onConfirm={handleDateSelect}
        title={
          datePickerMode === "delivery"
            ? "Chọn ngày giao hàng"
            : "Chọn ngày trả hàng"
        }
        minimumDate={
          datePickerMode === "delivery"
            ? (() => {
                // Ngày giao tối thiểu: ngày hiện tại + 3 ngày
                const minDate = new Date();
                minDate.setDate(minDate.getDate() + 3);
                minDate.setHours(0, 0, 0, 0); // Reset time để tránh lỗi so sánh
                return minDate;
              })()
            : datePickerMode === "return" && orderData.dueDate
              ? (() => {
                  const minDate = new Date(orderData.dueDate);
                  minDate.setDate(minDate.getDate() + 1); // Ngày trả phải sau ngày giao
                  minDate.setHours(0, 0, 0, 0);
                  return minDate;
                })()
              : new Date()
        }
        maximumDate={
          datePickerMode === "return" && orderData.dueDate
            ? (() => {
                // Ngày trả tối đa: ngày giao + 6 ngày
                const maxDate = new Date(orderData.dueDate);
                maxDate.setDate(maxDate.getDate() + 6);
                maxDate.setHours(0, 0, 0, 0);
                return maxDate;
              })()
            : undefined
        }
        initialDate={
          datePickerMode === "delivery"
            ? (() => {
                // Ngày giao mặc định: ngày hiện tại + 3 ngày
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 3);
                defaultDate.setHours(0, 0, 0, 0);
                return defaultDate;
              })()
            : datePickerMode === "return" && orderData.dueDate
              ? (() => {
                  // Ngày trả mặc định: ngày giao + 3 ngày
                  const defaultDate = new Date(orderData.dueDate);
                  defaultDate.setDate(defaultDate.getDate() + 3);
                  defaultDate.setHours(0, 0, 0, 0);
                  return defaultDate;
                })()
              : new Date()
        }
      />

      <CheckoutStatusModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        status={checkoutStatus.status}
        orderNumber={checkoutStatus.orderNumber}
        totalAmount={calculateTotalPrice()}
        orderType={type}
        onAction={handleStatusModalAction}
      />

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 44,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  stepIndicatorContainer: {
    marginBottom: 16,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCompleted: {
    backgroundColor: "#10B981",
  },
  stepCircleCurrent: {
    backgroundColor: "#E05C78",
  },
  stepCircleDisabled: {
    backgroundColor: "#D1D5DB",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepNumberDisabled: {
    color: "#6B7280",
  },
  stepTitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  stepTitleCompleted: {
    color: "#16A34A",
  },
  stepTitleCurrent: {
    color: "#E05C78",
  },
  stepTitleDisabled: {
    color: "#9CA3AF",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#E05C78",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
  },
  navigationContainer: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  buttonContainer: {
    flex: 1,
  },
});
