import { getTokens, getVeilaServerConfig } from "../../utils";
import {
  CustomRequestCreate,
  CustomRequestListResponse,
  CustomRequestResponse,
  CustomRequestUpdate,
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

  const responseData = await response.json();

  if (__DEV__) {
    console.log(`API ${options.method || "GET"} ${endpoint}:`, {
      status: response.status,
      ok: response.ok,
      data: responseData,
    });
  }

  if (response.status >= 200 && response.status < 300) {
    return responseData;
  }

  const errorMessage =
    responseData?.message || `HTTP error! status: ${response.status}`;
  throw new Error(errorMessage);
};

export const customRequestApi = {

  getMyRequests: async (
    page: number = 0,
    size: number = 10,
    filter?: string,
    sort?: string
  ): Promise<CustomRequestListResponse> => {
    let url = `/requests/me?page=${page}&size=${size}`;

    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }

    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }

    return makeRequest(url);
  },

  getRequestById: async (id: string): Promise<CustomRequestResponse> => {
    return makeRequest(`/requests/${id}/me`);
  },

  createRequest: async (
    data: CustomRequestCreate
  ): Promise<CustomRequestResponse> => {
    return makeRequest("/requests/me", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateRequest: async (
    id: string,
    data: CustomRequestUpdate
  ): Promise<CustomRequestResponse> => {
    return makeRequest(`/requests/${id}/me`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteRequest: async (
    id: string
  ): Promise<{ message: string; statusCode: number }> => {
    return makeRequest(`/requests/${id}/me`, {
      method: "DELETE",
    });
  },
};
