import { getTokens, getVeilaServerConfig } from "../../utils";
import { Order, OrderListResponse } from "../types/order.type";

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

export const orderApi = {
  getOrders: async (
    page: number = 0,
    size: number = 10
  ): Promise<OrderListResponse> => {
    return makeRequest(`/orders/customer?page=${page}&size=${size}`);
  },
  getOrderById: async (id: string): Promise<Order> => {
    return makeRequest(`/orders/${id}`);
  },
};
