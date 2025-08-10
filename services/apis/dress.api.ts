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

export const dressApi = {
  getDresses: async (
    page: number = 0,
    size: number = 10
  ): Promise<DressListResponse> => {
    return makeRequest(`/dresses?page=${page}&size=${size}`);
  },
  getDressById: async (id: string): Promise<Dress> => {
    return makeRequest(`/dresses/${id}`);
  },
};
