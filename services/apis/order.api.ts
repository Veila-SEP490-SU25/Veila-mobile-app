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
  dueDate: string | Date;
  returnDate?: string | Date;
  type: "SELL" | "RENT";
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
    role: string;
    status: string;
    reputation: number;
    isVerified: boolean;
    isIdentified: boolean;
  };
  shop: {
    id: string;
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

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<any> => {
    return makeRequest("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCustomerOrders: async (params?: {
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
    return makeRequest(`/orders/customer${qs ? `?${qs}` : ""}`);
  },

  getOrders: async (params?: {
    page?: number;
    size?: number;
    status?: string;
    type?: string;
  }): Promise<{ data: any[]; total: number }> => {
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

  getOrderById: async (id: string): Promise<any> => {
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
};
