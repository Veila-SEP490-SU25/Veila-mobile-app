import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
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
import Button from "./Button";
import CheckoutAccessories from "./CheckoutAccessories";
import CheckoutConfirmation from "./CheckoutConfirmation";
import CheckoutCustomerInfo from "./CheckoutCustomerInfo";
import CheckoutMeasurements from "./CheckoutMeasurements";
import CheckoutStatusModal from "./CheckoutStatusModal";
import DatePicker from "./DatePicker";

interface CheckoutPopupProps {
  visible: boolean;
  onClose: () => void;
  dressId: string;
  type: "SELL" | "RENT";
  onSuccess?: (orderNumber: string) => void;
  shopId?: string;
}

interface CheckoutStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function CheckoutPopup({
  visible,
  onClose,
  dressId,
  type,
  onSuccess,
  shopId,
}: CheckoutPopupProps) {
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    status: "SUCCESS" | "PENDING_PAYMENT" | "INSUFFICIENT_BALANCE" | "ERROR";
    orderNumber?: string;
    message?: string;
  }>({ status: "SUCCESS" });

  const [orderData, setOrderData] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    dueDate: null as string | null,
    returnDate: null as string | null,
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

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setOrderData({
      phone: user?.phone || "",
      email: user?.email || "",
      address: user?.address || "",
      dueDate: null,
      returnDate: null,
    });
    setMeasurements({
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
    setSelectedAccessories([]);
  }, [user, dressId]);

  const loadDressDetails = useCallback(async () => {
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
        await loadShopAccessories(targetShopId);
      } else {
        Toast.show({
          type: "warning",
          text1: "Thông báo",
          text2: "Không thể tải phụ kiện - thiếu thông tin shop",
        });
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
  }, [dressId, shopId]);

  useEffect(() => {
    if (visible && dressId) {
      loadDressDetails();
      resetForm();
    }
  }, [visible, dressId, loadDressDetails, resetForm]);

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
      if (response && response.items && Array.isArray(response.items)) {
        setShopAccessories(response.items);
      } else {
        setShopAccessories([]);
      }
    } catch (error) {
      console.error("Error loading shop accessories:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách phụ kiện",
      });
      setShopAccessories([]);
    }
  };

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

    let accessoriesTotal = 0;
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
            accessoriesTotal += price * selected.quantity;
          }
        } else if (
          type === "RENT" &&
          accessory.rentalPrice &&
          accessory.rentalPrice !== "0"
        ) {
          const price = parseFloat(accessory.rentalPrice);
          if (!isNaN(price) && price > 0) {
            accessoriesTotal += price * selected.quantity;
          }
        }
      }
    });

    total += accessoriesTotal;
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

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [stepValidation, setStepValidation] = useState<{
    [key: number]: boolean;
  }>({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    const formData = {
      currentStep,
      measurements,
      orderData,
      selectedAccessories,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem("checkoutFormProgress", JSON.stringify(formData));
    } catch (error) {

    }
  }, [currentStep, measurements, orderData, selectedAccessories]);

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case "phone":
        if (!value) return "Số điện thoại là bắt buộc";

        const cleanPhone = value.replace(/\D/g, "");

        if (cleanPhone.length < 9) {
          return "Số điện thoại quá ngắn (cần ít nhất 9 chữ số)";
        }
        if (cleanPhone.length > 11) {
          return "Số điện thoại quá dài (tối đa 11 chữ số)";
        }

        if (!/^[0-9]+$/.test(cleanPhone)) {
          return "Số điện thoại chỉ được chứa chữ số";
        }

        if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
          return null;
        }

        if (cleanPhone.length >= 9 && cleanPhone.length <= 11) {
          return null;
        }

        return "Số điện thoại không hợp lệ";

      case "email":
        if (!value) return "Email là bắt buộc";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Email không hợp lệ";
        }
        return null;

      case "address":
        if (!value) return "Địa chỉ là bắt buộc";
        if (value.length < 10) {
          return "Địa chỉ phải có ít nhất 10 ký tự";
        }
        return null;

      case "dueDate":
        if (!value || value === "" || value === null)
          return "Ngày giao hàng là bắt buộc";

        let dueDate: Date;
        try {

          const [year, month, day] = String(value).split("-").map(Number);
          dueDate = new Date(year, month - 1, day, 0, 0, 0, 0);

          if (isNaN(dueDate.getTime())) {
            return "Ngày giao hàng không hợp lệ";
          }
        } catch {
          return "Ngày giao hàng không hợp lệ";
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          return "Ngày giao hàng phải từ hôm nay trở đi";
        }
        return null;

      case "returnDate":

        if (type === "SELL") {
          return null;
        }

        if (type === "RENT") {
          if (!value || value === "" || value === null) {
            return "Ngày trả hàng là bắt buộc cho đơn hàng thuê";
          }

          if (orderData.dueDate) {
            let returnDate: Date;
            let dueDate: Date;

            try {

              const [returnYear, returnMonth, returnDay] = String(value)
                .split("-")
                .map(Number);
              returnDate = new Date(
                returnYear,
                returnMonth - 1,
                returnDay,
                0,
                0,
                0,
                0
              );

              const [dueYear, dueMonth, dueDay] = String(orderData.dueDate)
                .split("-")
                .map(Number);
              dueDate = new Date(dueYear, dueMonth - 1, dueDay, 0, 0, 0, 0);

              if (isNaN(returnDate.getTime()) || isNaN(dueDate.getTime())) {
                return "Ngày không hợp lệ";
              }

              if (returnDate <= dueDate) {
                return "Ngày trả hàng phải sau ngày giao hàng";
              }
            } catch {
              return "Ngày không hợp lệ";
            }
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
    const ranges: Record<
      keyof DressDetails,
      { min: number; max: number; unit: string }
    > = {
      dressId: { min: 0, max: 0, unit: "" },
      height: { min: 100, max: 250, unit: "cm" },
      weight: { min: 20, max: 200, unit: "kg" },
      bust: { min: 50, max: 200, unit: "cm" },
      waist: { min: 40, max: 150, unit: "cm" },
      hip: { min: 50, max: 200, unit: "cm" },
      armpit: { min: 5, max: 50, unit: "cm" },
      bicep: { min: 5, max: 50, unit: "cm" },
      neck: { min: 15, max: 50, unit: "cm" },
      shoulderWidth: { min: 20, max: 80, unit: "cm" },
      sleeveLength: { min: 10, max: 100, unit: "cm" },
      backLength: { min: 20, max: 100, unit: "cm" },
      lowerWaist: { min: 30, max: 150, unit: "cm" },
      waistToFloor: { min: 30, max: 200, unit: "cm" },
    };

    const range = ranges[field];
    if (!range || field === "dressId") return null;

    if (value < range.min || value > range.max) {
      return `${field} phải từ ${range.min} đến ${range.max} ${range.unit}`;
    }

    return null;
  };

  const updateOrderData = (field: string, value: string | null) => {
    setOrderData((prev) => ({ ...prev, [field]: value }));

    if (currentStep === 0) {

      setValidationErrors((prev) => ({ ...prev, [field]: "" }));

      const error = validateField(field, value);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      }
    }

    setIsFormDirty(true);
  };

  const updateMeasurement = (field: keyof DressDetails, value: number) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));

    if (currentStep === 1) {

      setValidationErrors((prev) => ({
        ...prev,
        [`measurement_${String(field)}`]: "",
      }));

      const error = validateMeasurementField(field, value);
      if (error) {
        setValidationErrors((prev) => ({
          ...prev,
          [`measurement_${String(field)}`]: error,
        }));
      }
    }

    setIsFormDirty(true);
  };

  const isCurrentStepValid = (): boolean => {
    return true;
  };

  const validateStep = (stepIndex: number): boolean => {
    const errors: { [key: string]: string } = {};

    switch (stepIndex) {
      case 0:
        const phoneError = validateField("phone", orderData.phone);
        const emailError = validateField("email", orderData.email);
        const addressError = validateField("address", orderData.address);
        const dueDateError = validateField("dueDate", orderData.dueDate);
        const returnDateError = validateField(
          "returnDate",
          orderData.returnDate
        );

        if (phoneError) errors.phone = phoneError;
        if (emailError) errors.email = emailError;
        if (addressError) errors.address = addressError;
        if (dueDateError) errors.dueDate = dueDateError;
        if (returnDateError) errors.returnDate = returnDateError;
        break;

      case 1:
        const requiredFields: (keyof DressDetails)[] = [
          "height",
          "bust",
          "waist",
          "hip",
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
        break;

      case 2:
        break;

      case 3:
        break;

      default:
        return false;
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setStepValidation((prev) => ({ ...prev, [stepIndex]: isValid }));

    return isValid;
  };

  const clearStepErrors = (stepIndex: number) => {
    const errors = { ...validationErrors };

    switch (stepIndex) {
      case 0:
        delete errors.phone;
        delete errors.email;
        delete errors.address;
        delete errors.dueDate;
        delete errors.returnDate;
        break;
      case 1:
        Object.keys(errors).forEach((key) => {
          if (key.startsWith("measurement_")) {
            delete errors[key];
          }
        });
        break;
    }

    setValidationErrors(errors);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      steps[currentStep].isCompleted = true;

      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: `Đã hoàn thành bước ${currentStep + 1}`,
        visibilityTime: 2000,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];

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

      const createLocalDate = (dateString: string): Date => {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
      };

      const validatedMeasurements = {
        ...measurements,
        dressId: measurements.dressId || dressId,
      };

      Object.keys(validatedMeasurements).forEach((key) => {
        if (
          key !== "dressId" &&
          typeof validatedMeasurements[key as keyof DressDetails] !== "number"
        ) {
          (validatedMeasurements as any)[key] = 0;
        }
      });

      const orderRequest: CreateOrderRequest = {
        newOrder: {
          phone: orderData.phone,
          email: orderData.email,
          address: orderData.address,
          dueDate: orderData.dueDate
            ? createLocalDate(orderData.dueDate)
            : new Date(),
          type: type as "SELL" | "RENT",

          ...(type === "RENT" &&
            orderData.returnDate && {
              returnDate: createLocalDate(orderData.returnDate),
            }),
        },
        dressDetails: validatedMeasurements,
        accessoriesDetails: selectedAccessories,
      };

      if (type === "SELL") {
        delete (orderRequest.newOrder as any).returnDate;
      }

      console.log(
        "🚀 Sending order request:",
        JSON.stringify(orderRequest, null, 2)
      );

      const result = await orderApi.createOrder(orderRequest);

      console.log("✅ Order API response:", result);

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
          setShowStatusModal(true);
        } else if (
          errorMessage.includes("validation") ||
          errorMessage.includes("must be")
        ) {

          Toast.show({
            type: "error",
            text1: "Lỗi thông tin",
            text2: errorMessage,
            visibilityTime: 5000,
          });
          setCurrentStep(0);
        } else {
          setCheckoutStatus({
            status: "ERROR",
            message: errorMessage,
          });
          setShowStatusModal(true);
        }
        return;
      }

      setCheckoutStatus({
        status: "SUCCESS",
        orderNumber: result.orderNumber || "ORDER_SUCCESS",
      });
      setShowStatusModal(true);
    } catch (error: any) {
      console.error("❌ Error creating order:", error);
      console.error("❌ Error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack,
      });

      if (error.message && error.message.includes("status: 500")) {
        Toast.show({
          type: "error",
          text1: "Lỗi máy chủ (500)",
          text2:
            "Máy chủ đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
          visibilityTime: 6000,
        });

        setCheckoutStatus({
          status: "ERROR",
          message: "Lỗi máy chủ (500) - Vui lòng thử lại sau",
        });
        setShowStatusModal(true);
        return;
      }

      if (error.message && error.message.includes("HTTP error!")) {
        const statusMatch = error.message.match(/status: (\d+)/);
        const status = statusMatch ? statusMatch[1] : "unknown";

        if (status === "500") {
          Toast.show({
            type: "error",
            text1: "Lỗi máy chủ (500)",
            text2: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
            visibilityTime: 6000,
          });
        } else {
          Toast.show({
            type: "error",
            text1: `Lỗi HTTP ${status}`,
            text2: "Vui lòng kiểm tra lại thông tin và thử lại",
            visibilityTime: 6000,
          });
        }

        setCheckoutStatus({
          status: "ERROR",
          message: `Lỗi HTTP ${status} - Vui lòng thử lại sau`,
        });
        setShowStatusModal(true);
        return;
      }

      if (error.message) {
        if (
          error.message.includes("insufficient") ||
          error.message.includes("balance")
        ) {
          setCheckoutStatus({
            status: "INSUFFICIENT_BALANCE",
            message: error.message,
          });
          setShowStatusModal(true);
        } else if (
          error.message.includes("unauthorized") ||
          error.message.includes("401")
        ) {
          Toast.show({
            type: "error",
            text1: "Phiên đăng nhập hết hạn",
            text2: "Vui lòng đăng nhập lại",
            visibilityTime: 5000,
          });
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          Toast.show({
            type: "error",
            text1: "Lỗi kết nối",
            text2: "Vui lòng kiểm tra kết nối internet và thử lại",
            visibilityTime: 5000,
          });
        } else if (error.message.includes("timeout")) {
          Toast.show({
            type: "error",
            text1: "Hết thời gian chờ",
            text2: "Vui lòng thử lại sau",
            visibilityTime: 5000,
          });
        } else {

          setCheckoutStatus({
            status: "ERROR",
            message: error.message,
          });
          setShowStatusModal(true);
        }
      } else {

        setCheckoutStatus({
          status: "ERROR",
          message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        });
        setShowStatusModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusModalAction = (action: string) => {
    switch (action) {
      case "VIEW_ORDER":
        if (onSuccess && checkoutStatus.orderNumber) {
          onSuccess(checkoutStatus.orderNumber);
        }
        onClose();
        break;

      case "PAY_NOW":
        if (onSuccess && checkoutStatus.orderNumber) {
          onSuccess(checkoutStatus.orderNumber);
        }
        onClose();
        break;

      case "TOPUP_WALLET":
        if (onSuccess) {
          onSuccess("INSUFFICIENT_BALANCE");
        }
        onClose();
        break;

      case "VIEW_WALLET":
        if (onSuccess) {
          onSuccess("VIEW_WALLET");
        }
        onClose();
        break;

      case "CONTINUE_SHOPPING":
        onClose();
        break;

      case "RETRY":
        setShowStatusModal(false);
        setCheckoutStatus({ status: "SUCCESS" });
        break;

      case "CONTACT_SUPPORT":
        onClose();
        break;

      default:
        onClose();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CheckoutCustomerInfo
            orderData={orderData}
            type={type}
            onUpdateOrderData={updateOrderData}
            onOpenDatePicker={openDatePicker}
          />
        );
      case 1:
        return (
          <CheckoutMeasurements
            measurements={measurements}
            onUpdateMeasurement={updateMeasurement}
          />
        );
      case 2:
        return (
          <CheckoutAccessories
            shopAccessories={shopAccessories}
            selectedAccessories={selectedAccessories}
            type={type}
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
          const isCompleted = step.isCompleted;

          const isAccessible = index <= currentStep + 1;

          return (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted
                    ? styles.stepCircleCompleted
                    : isCurrent
                      ? styles.stepCircleCurrent
                      : isAccessible
                        ? styles.stepCircleAccessible
                        : styles.stepCircleDisabled,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isCurrent || isAccessible
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
                      : isAccessible
                        ? styles.stepTitleAccessible
                        : styles.stepTitleDisabled,
                ]}
              >
                {step.title}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar with percentage */}
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
        {/* Navigation Buttons */}
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

        {/* Step Navigation Hints */}
        <View style={styles.navigationHints}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={prevStep} style={styles.navigationHint}>
              <Text style={styles.navigationHintText}>← Bước trước</Text>
            </TouchableOpacity>
          )}
          {currentStep < steps.length - 1 && (
            <TouchableOpacity onPress={nextStep} style={styles.navigationHint}>
              <Text style={styles.navigationHintText}>Bước tiếp →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleClose = () => {
    if (isFormDirty) {
      Toast.show({
        type: "info",
        text1: "Bạn có chắc muốn đóng?",
        text2: "Thông tin đã nhập sẽ bị mất",
        onPress: () => {

          onClose();
        },
        visibilityTime: 3000,
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {type === "SELL" ? "Mua váy" : "Thuê váy"}
          </Text>
          <View style={styles.modalHeaderSpacer} />
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepIndicator()}
          {renderCurrentStep()}
          {renderNavigationButtons()}
        </ScrollView>

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
    </Modal>
  );
}

const styles = StyleSheet.create({

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
  stepCircleAccessible: {
    backgroundColor: "#3B82F6",
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
  stepTitleAccessible: {
    color: "#2563EB",
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
  navigationHints: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  navigationHint: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
  },
  navigationHintText: {
    fontSize: 12,
    color: "#6B7280",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalHeaderSpacer: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
