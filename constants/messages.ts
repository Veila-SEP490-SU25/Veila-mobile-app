/**
 * Veila Message Code System
 * Centralized message management with code-based approach
 */

export interface MessageConfig {
  code: string;
  type: "system" | "error" | "confirm" | "info" | "success" | "warning";
  context: string;
  content: string;
}

export const MESSAGES: Record<string, MessageConfig> = {

  SSM001: {
    code: "SSM001",
    type: "system",
    context:
      "Session – When the login session expires while the user is browsing products, chatting, or placing an order",
    content: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  },
  SSM002: {
    code: "SSM002",
    type: "system",
    context:
      "Server – When the system is under scheduled or emergency maintenance, all actions are temporarily disabled",
    content: "Hệ thống đang bảo trì. Vui lòng thử lại sau.",
  },
  SSM003: {
    code: "SSM003",
    type: "system",
    context:
      "Network – When the user is searching, placing an order, or sending a message but loses Internet connection",
    content: "Mất kết nối. Vui lòng kiểm tra đường truyền Internet.",
  },

  ERM001: {
    code: "ERM001",
    type: "error",
    context:
      "Authentication – Login failed due to incorrect username or password",
    content: "Tên đăng nhập hoặc mật khẩu không đúng.",
  },
  ERM002: {
    code: "ERM002",
    type: "error",
    context:
      "Registration – When registering a new account but the email already exists in the system",
    content: "Email đã tồn tại.",
  },
  ERM003: {
    code: "ERM003",
    type: "error",
    context:
      "OTP – When verifying phone number or email but the OTP is invalid or expired",
    content: "Mã xác thực không hợp lệ.",
  },
  ERM004: {
    code: "ERM004",
    type: "error",
    context:
      "Wallet – When attempting to pay or withdraw but wallet balance is insufficient",
    content: "Số dư ví không đủ.",
  },
  ERM005: {
    code: "ERM005",
    type: "error",
    context:
      "Payment – When a payment transaction fails at the payment gateway",
    content: "Giao dịch thanh toán thất bại.",
  },
  ERM006: {
    code: "ERM006",
    type: "error",
    context:
      "Order – When the system cannot process the order due to invalid data or server error",
    content: "Không thể xử lý đơn hàng. Vui lòng thử lại.",
  },
  ERM007: {
    code: "ERM007",
    type: "error",
    context:
      "Address – When entering or updating shipping address but mandatory fields are missing",
    content: "Địa chỉ không hợp lệ hoặc chưa đầy đủ.",
  },
  ERM008: {
    code: "ERM008",
    type: "error",
    context:
      "Access – When a user attempts to access a feature or screen outside their permissions",
    content: "Bạn không có quyền thực hiện hành động này.",
  },

  CFM001: {
    code: "CFM001",
    type: "confirm",
    context:
      "Order Cancel – When the user selects to cancel an order that is pending or in progress",
    content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
  },
  CFM002: {
    code: "CFM002",
    type: "confirm",
    context: "Logout – When the user clicks to log out from the account",
    content: "Bạn có chắc chắn muốn đăng xuất không?",
  },
  CFM003: {
    code: "CFM003",
    type: "confirm",
    context:
      "Wallet – When the user requests to top up the wallet and must confirm the transaction",
    content: "Bạn có xác nhận yêu cầu nạp tiền này không?",
  },
  CFM004: {
    code: "CFM004",
    type: "confirm",
    context:
      "Delete – When the user deletes an address, favorite product, or blog post",
    content: "Bạn có chắc chắn muốn xóa mục này không?",
  },

  INF001: {
    code: "INF001",
    type: "info",
    context:
      "Order – When the order status changes (confirmed, shipping, completed)",
    content: "Trạng thái đơn hàng của bạn đã được cập nhật.",
  },
  INF002: {
    code: "INF002",
    type: "info",
    context:
      "Notification – When the user receives a new chat message from a supplier",
    content: "Bạn có tin nhắn mới từ nhà cung cấp.",
  },
  INF003: {
    code: "INF003",
    type: "info",
    context:
      "Review – When the user successfully submits a review for a product/service",
    content: "Đánh giá của bạn đã được gửi thành công.",
  },
  INF004: {
    code: "INF004",
    type: "info",
    context: "Blog – When a supplier or admin publishes a new blog post",
    content: "Bài viết mới đã được đăng tải.",
  },
  INF005: {
    code: "INF005",
    type: "info",
    context:
      "Subscription – When the supplier's subscription package is about to expire, system sends reminder",
    content: "Gói đăng ký của bạn sẽ hết hạn sau 3 ngày.",
  },

  SUC001: {
    code: "SUC001",
    type: "success",
    context:
      "Wallet – When a wallet top-up is successfully completed via payment gateway",
    content: "Nạp tiền thành công.",
  },
  SUC002: {
    code: "SUC002",
    type: "success",
    context: "Payment – When the user successfully completes an order payment",
    content: "Thanh toán thành công.",
  },
  SUC003: {
    code: "SUC003",
    type: "success",
    context:
      "Order – When the user successfully places an order for dress, accessory, or service",
    content: "Đơn hàng của bạn đã được đặt thành công.",
  },
  SUC004: {
    code: "SUC004",
    type: "success",
    context:
      "Profile – When the user successfully updates personal profile information",
    content: "Hồ sơ của bạn đã được cập nhật.",
  },
  SUC005: {
    code: "SUC005",
    type: "success",
    context: "Address – When the user successfully adds a new shipping address",
    content: "Đã thêm địa chỉ mới thành công.",
  },
  SUC006: {
    code: "SUC006",
    type: "success",
    context:
      "Complaint – When the user successfully submits a complaint to supplier or admin",
    content: "Khiếu nại của bạn đã được gửi thành công.",
  },
  SUC007: {
    code: "SUC007",
    type: "success",
    context:
      "Supplier Registration – When a supplier successfully completes registration on Veila",
    content: "Đăng ký cửa hàng đã được gửi thành công.",
  },
  SUC008: {
    code: "SUC008",
    type: "success",
    context:
      "Blog – When a supplier or admin successfully publishes a blog post",
    content: "Bài viết đã được tạo thành công.",
  },

  WRN001: {
    code: "WRN001",
    type: "warning",
    context: "Order – When an order is confirmed and can no longer be modified",
    content: "Đơn hàng này sẽ không thể chỉnh sửa sau khi xác nhận.",
  },
};

/**
 * Get message by code
 */
export const getMessage = (code: string): MessageConfig | null => {
  return MESSAGES[code] || null;
};

/**
 * Get message content by code
 */
export const getMessageContent = (code: string, fallback?: string): string => {
  return MESSAGES[code]?.content || fallback || `Message not found: ${code}`;
};
