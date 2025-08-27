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
  getShops: async (
    page: number = 0,
    size: number = 10,
    filter?: string,
    sort?: string
  ): Promise<ShopListResponse> => {
    let url = `/shops?page=${page}&size=${size}`;

    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }

    return makeRequest(url);
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
};
