import { getTokens, getVeilaServerConfig } from "../../utils";

const API_URL = getVeilaServerConfig();

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const { accessToken } = await getTokens();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export interface DressDetails {
  dressId: string;
  height: number;
  weight: number;
  bust: number;
  waist: number;
  hip: number;
  armpit: number;
  bicep: number;
  neck: number;
  shoulderWidth: number;
  sleeveLength: number;
  backLength: number;
  lowerWaist: number;
  waistToFloor: number;
}

export interface AccessoryDetail {
  accessoryId: string;
  quantity: number;
}

export interface NewOrder {
  phone: string;
  email: string;
  address: string;
  dueDate: string;
  returnDate?: string;
  type: "SELL" | "RENT" | "CUSTOM";
}

export interface CreateOrderRequest {
  newOrder: NewOrder;
  dressDetails: DressDetails;
  accessoriesDetails: AccessoryDetail[];
}

export interface CustomerOrderResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  phone: string;
  email: string;
  address: string;
  dueDate: string;
  returnDate: string | null;
  amount: string;
  type: "SELL" | "RENT" | "CUSTOM";
  status: string;
  customer: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    username: string;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    phone: string;
    address: string;
    birthDate: string;
    avatarUrl: string | null;
    coverUrl: string;
    favDresses: string[];
    favShops: string[];
    role: string;
    status: string;
    reputation: number;
    isVerified: boolean;
    isIdentified: boolean;
  };
  shop: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    logoUrl: string;
    coverUrl: string;
    status: string;
    reputation: number;
    isVerified: boolean;
  };
  customerName: string;
  shopName: string;
}

export interface CustomerOrdersResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: CustomerOrderResponse[];
}

export interface CheckoutRequest {
  otp: string;
}

export interface CheckoutResponse {
  message: string;
  statusCode: number;
  item?: any;
}

export interface OrderServiceDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  price: string;
  isRated: boolean;
  request: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    title: string;
    description: string;
    height: number;
    weight: number;
    bust: number;
    waist: number;
    hip: number;
    armpit: number;
    bicep: number;
    neck: number;
    shoulderWidth: number;
    sleeveLength: number;
    backLength: number;
    lowerWaist: number;
    waistToFloor: number;
    material: string | null;
    color: string | null;
    length: string | null;
    neckline: string | null;
    sleeve: string | null;
    images: string;
    status: string;
    isPrivate: boolean;
  };
  service: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    description: string;
    images: string;
    ratingAverage: string;
    ratingCount: number;
    status: string;
  };
  updateOrderServiceDetails: any[];
}

export interface OrderServiceDetailsResponse {
  message: string;
  statusCode: number;
  item: OrderServiceDetails;
}

export interface ComplaintReason {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  code: string;
  reason: string;
  reputationPenalty: number;
  type: string;
}

export interface ComplaintReasonsResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: ComplaintReason[];
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  reason: string;
  images?: string;
  status: string;
}

export interface CreateComplaintResponse {
  message: string;
  statusCode: number;
  item: any;
}

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<any> => {
    return makeRequest("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getOrders: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    type?: string;
  }): Promise<CustomerOrdersResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params?.size !== undefined)
      queryParams.append("size", String(params.size));
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);

    const qs = queryParams.toString();
    return makeRequest(`/orders${qs ? `?${qs}` : ""}`);
  },

  getOrderById: async (
    id: string
  ): Promise<{
    message: string;
    statusCode: number;
    item: CustomerOrderResponse;
  }> => {
    return makeRequest(`/orders/${id}`);
  },

  cancelOrder: async (orderId: string, status: string): Promise<any> => {
    if (status !== "PENDING") {
      throw new Error("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
    }

    return makeRequest(`/orders/${orderId}/cancel`, {
      method: "PUT",
    });
  },

  createCustomOrder: async (data: {
    phone: string;
    email: string;
    address: string;
    requestId: string;
    shopId: string;
  }): Promise<{ success: boolean; message?: string; orderNumber?: string }> => {
    try {
      const { accessToken } = await getTokens();
      const response = await fetch(`${API_URL}/orders/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          orderNumber: responseData.orderNumber || "CUSTOM_ORDER_SUCCESS",
          message: responseData.message || "Đặt may thành công",
        };
      } else {
        return {
          success: false,
          message: responseData.message || "Có lỗi xảy ra khi đặt may",
        };
      }
    } catch (error: any) {
      console.error("Error creating custom order:", error);
      return {
        success: false,
        message: error.message || "Có lỗi xảy ra khi đặt may",
      };
    }
  },

  getOrderDressDetails: async (
    orderId: string
  ): Promise<{
    message: string;
    statusCode: number;
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    items: any[];
  }> => {
    return makeRequest(`/orders/${orderId}/order-dress-details`);
  },

  getOrderAccessoryDetails: async (
    orderId: string
  ): Promise<{
    message: string;
    statusCode: number;
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    items: any[];
  }> => {
    return makeRequest(`/orders/${orderId}/order-accessories-details`);
  },

  getOrderMilestones: async (
    orderId: string
  ): Promise<{
    message: string;
    statusCode: number;
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    items: any[];
  }> => {
    return makeRequest(`/orders/${orderId}/milestones`);
  },

  getOrderServiceDetails: async (
    orderId: string
  ): Promise<OrderServiceDetailsResponse> => {
    return makeRequest(`/orders/${orderId}/order-service-details`);
  },

  getComplaintReasons: async (): Promise<ComplaintReasonsResponse> => {
    return makeRequest("/complaints/reasons");
  },

  createComplaint: async (
    orderId: string,
    data: CreateComplaintRequest
  ): Promise<CreateComplaintResponse> => {
    return makeRequest(`/orders/${orderId}/complaints/me`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  checkoutOrder: async (
    orderId: string,
    data: CheckoutRequest
  ): Promise<CheckoutResponse> => {
    return makeRequest(`/orders/${orderId}/check-out`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
