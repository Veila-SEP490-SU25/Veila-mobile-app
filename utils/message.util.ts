import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { getMessage, MessageConfig } from "../constants/messages";

/**
 * Get toast type based on message type
 */
export const getToastType = (
  messageType: MessageConfig["type"]
): "success" | "error" | "info" => {
  switch (messageType) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "info":
    case "system":
    case "warning":
    case "confirm":
    default:
      return "info";
  }
};

/**
 * Show Toast message by code
 */
export const showMessage = (
  code: string,
  title?: string,
  options?: {
    duration?: number;
    position?: "top" | "bottom";
    onPress?: () => void;
  }
) => {
  const message = getMessage(code);
  if (!message) {

    Toast.show({
      type: "error",
      text1: "Lỗi hệ thống",
      text2: "Có lỗi xảy ra, vui lòng thử lại",
      position: "top",
    });
    return;
  }

  Toast.show({
    type: getToastType(message.type),
    text1: title || getMessageTitle(message.type),
    text2: message.content,
    position: options?.position || "top",
    visibilityTime: options?.duration || 4000,
    onPress: options?.onPress,
  });
};

/**
 * Show confirmation dialog by code
 */
export const showConfirm = (
  code: string,
  onConfirm: () => void,
  onCancel?: () => void,
  customTitle?: string
): void => {
  const message = getMessage(code);
  if (!message) {
    return;
  }

  Alert.alert(customTitle || "Xác nhận", message.content, [
    {
      text: "Hủy",
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: "Xác nhận",
      style: "default",
      onPress: onConfirm,
    },
  ]);
};

/**
 * Get default title for message type
 */
const getMessageTitle = (type: MessageConfig["type"]): string => {
  switch (type) {
    case "success":
      return "Thành công";
    case "error":
      return "Lỗi";
    case "warning":
      return "Cảnh báo";
    case "info":
      return "Thông tin";
    case "system":
      return "Hệ thống";
    case "confirm":
      return "Xác nhận";
    default:
      return "Thông báo";
  }
};

/**
 * Backward compatibility - replace common Toast.show patterns
 */
export const showSuccessToast = (message: string) => {

  const matchingCode = findMessageByContent(message);
  if (matchingCode) {
    showMessage(matchingCode);
  } else {
    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: message,
      position: "top",
    });
  }
};

export const showErrorToast = (message: string) => {

  const matchingCode = findMessageByContent(message);
  if (matchingCode) {
    showMessage(matchingCode);
  } else {
    Toast.show({
      type: "error",
      text1: "Lỗi",
      text2: message,
      position: "top",
    });
  }
};

export const showInfoToast = (message: string) => {

  const matchingCode = findMessageByContent(message);
  if (matchingCode) {
    showMessage(matchingCode);
  } else {
    Toast.show({
      type: "info",
      text1: "Thông tin",
      text2: message,
      position: "top",
    });
  }
};

/**
 * Helper to find message code by content (fuzzy matching)
 */
const findMessageByContent = (content: string): string | null => {
  const normalizedContent = content.toLowerCase().trim();

  const mappings: Record<string, string> = {
    "đăng nhập thành công": "SUC004",
    "thanh toán thành công": "SUC002",
    "đặt hàng thành công": "SUC003",
    "nạp tiền thành công": "SUC001",
    "cập nhật thành công": "SUC004",
    "thêm địa chỉ thành công": "SUC005",
    "đăng ký thành công": "SUC007",

    "đăng nhập thất bại": "ERM001",
    "tên đăng nhập hoặc mật khẩu không đúng": "ERM001",
    "email đã tồn tại": "ERM002",
    "mã xác thực không hợp lệ": "ERM003",
    "số dư không đủ": "ERM004",
    "thanh toán thất bại": "ERM005",
    "không thể xử lý đơn hàng": "ERM006",
    "địa chỉ không hợp lệ": "ERM007",
    "không có quyền": "ERM008",

    "mất kết nối": "SSM003",
    "hết phiên": "SSM001",
    "bảo trì": "SSM002",
  };

  for (const [key, code] of Object.entries(mappings)) {
    if (normalizedContent.includes(key)) {
      return code;
    }
  }

  return null;
};

export const showLoginError = () => showMessage("ERM001");
export const showNetworkError = () => showMessage("SSM003");
export const showSessionExpired = () => showMessage("SSM001");
export const showPaymentSuccess = () => showMessage("SUC002");
export const showOrderSuccess = () => showMessage("SUC003");
export const showWalletError = () => showMessage("ERM004");
export const showOTPError = () => showMessage("ERM003");

export const confirmLogout = (onConfirm: () => void, onCancel?: () => void) => {
  showConfirm("CFM002", onConfirm, onCancel);
};

export const confirmOrderCancel = (
  onConfirm: () => void,
  onCancel?: () => void
) => {
  showConfirm("CFM001", onConfirm, onCancel);
};

export const confirmDelete = (onConfirm: () => void, onCancel?: () => void) => {
  showConfirm("CFM004", onConfirm, onCancel);
};
