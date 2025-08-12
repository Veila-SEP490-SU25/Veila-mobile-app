import { getTokens, getVeilaServerConfig } from "../../utils";
import { WalletResponse } from "../types/wallet.type";

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

export const walletApi = {
  getMyWallet: async (): Promise<WalletResponse> => {
    return makeRequest("/wallet/my-wallet");
  },
}; 