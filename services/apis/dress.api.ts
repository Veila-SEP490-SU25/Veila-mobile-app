import { getTokens, getVeilaServerConfig } from "../../utils";
import { Dress, DressListResponse } from "../types/dress.type";

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

export type DressQuery = {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
  mode?: "buy" | "rent";
};

export const dressApi = {
  getDresses: async (query: DressQuery = {}): Promise<DressListResponse> => {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.append("page", String(query.page));
    if (query.size !== undefined) params.append("size", String(query.size));
    if (query.sort) params.append("sort", query.sort);
    if (query.filter) params.append("filter", query.filter);
    if (query.mode) params.append("mode", query.mode);
    const qs = params.toString();
    return makeRequest(`/dresses${qs ? `?${qs}` : ""}`);
  },
  getDressById: async (id: string): Promise<Dress> => {
    return makeRequest(`/dresses/${id}`);
  },
  toggleFavorite: async (id: string): Promise<void> => {
    await makeRequest(`/dresses/${id}/favorites`, { method: "POST" });
  },
  getFavoriteDresses: async (): Promise<Dress[]> => {
    return makeRequest(`/dresses/favorites`);
  },
};
