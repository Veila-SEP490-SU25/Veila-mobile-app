import { getTokens, getVeilaServerConfig } from "../../utils";
import {
  AccessoryListResponse,
  CategoryListResponse,
  DressListResponse,
  ServiceListResponse,
  Shop,
  ShopDetail,
  ShopListResponse,
} from "../types";

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

export const shopApi = {
  getShops: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
  }): Promise<ShopListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params?.size !== undefined)
      queryParams.append("size", String(params.size));
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);

    const qs = queryParams.toString();
    return makeRequest(`/shops${qs ? `?${qs}` : ""}`);
  },

  getShopById: async (id: string): Promise<ShopDetail> => {
    return makeRequest(`/shops/${id}`);
  },

  getShopDresses: async (
    shopId: string,
    page: number = 0,
    size: number = 10
  ): Promise<DressListResponse> => {
    return makeRequest(`/shops/${shopId}/dresses?page=${page}&size=${size}`);
  },

  getShopCategories: async (
    shopId: string,
    page: number = 0,
    size: number = 10
  ): Promise<CategoryListResponse> => {
    return makeRequest(`/shops/${shopId}/categories?page=${page}&size=${size}`);
  },

  getShopAccessories: async (
    shopId: string,
    page: number = 0,
    size: number = 10
  ): Promise<AccessoryListResponse> => {
    return makeRequest(
      `/shops/${shopId}/accessories?page=${page}&size=${size}`
    );
  },

  getShopServices: async (
    shopId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ServiceListResponse> => {
    return makeRequest(`/shops/${shopId}/services?page=${page}&size=${size}`);
  },

  getShopBlogs: async (
    shopId: string,
    page: number = 0,
    size: number = 10
  ): Promise<any> => {
    return makeRequest(`/shops/${shopId}/blogs?page=${page}&size=${size}`);
  },

  getAccessoryById: async (id: string): Promise<any> => {
    return makeRequest(`/accessories/${id}`);
  },

  toggleFavorite: async (id: string): Promise<void> => {
    await makeRequest(`/shops/${id}/favorites`, { method: "POST" });
  },

  getFavoriteShops: async (): Promise<Shop[]> => {
    return makeRequest(`/shops/favorites`);
  },

  registerShop: async (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    licenseImages: string;
  }): Promise<{
    success: boolean;
    message: string;
    shopId?: string;
  }> => {
    try {
      const { accessToken } = await getTokens();
      const response = await fetch(`${API_URL}/shops/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.status === 201) {
        return {
          success: true,
          message: responseData.message || "Đăng ký shop thành công",
          shopId: responseData.shopId,
        };
      } else {
        return {
          success: false,
          message: responseData.message || "Có lỗi xảy ra khi đăng ký shop",
        };
      }
    } catch (error: any) {
      console.error("Error registering shop:", error);
      return {
        success: false,
        message: error.message || "Có lỗi xảy ra khi đăng ký shop",
      };
    }
  },
};
