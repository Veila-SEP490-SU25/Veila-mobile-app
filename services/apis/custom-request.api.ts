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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const customRequestApi = {
  // Get all custom requests for current user with search and filter
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

  // Get custom request detail by ID
  getRequestById: async (id: string): Promise<CustomRequestResponse> => {
    return makeRequest(`/requests/${id}/me`);
  },

  // Create new custom request
  createRequest: async (
    data: CustomRequestCreate
  ): Promise<CustomRequestResponse> => {
    return makeRequest("/requests/me", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update custom request
  updateRequest: async (
    id: string,
    data: CustomRequestUpdate
  ): Promise<CustomRequestResponse> => {
    return makeRequest(`/requests/${id}/me`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete custom request
  deleteRequest: async (
    id: string
  ): Promise<{ message: string; statusCode: number }> => {
    return makeRequest(`/requests/${id}/me`, {
      method: "DELETE",
    });
  },
};
