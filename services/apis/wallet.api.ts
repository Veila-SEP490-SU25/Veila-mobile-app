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

export interface DepositRequest {
  amount: number;
  note?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface DepositResponseItem {
  transactionId: string;
  orderCode: number;
  checkoutUrl: string;
  qrCode: string;
  expiredAt: number;
}

export interface DepositResponse {
  message: string;
  statusCode: number;
  item: DepositResponseItem;
}

export const walletApi = {
  getMyWallet: async (): Promise<WalletResponse> => {
    return makeRequest("/wallets/my-wallet");
  },
  deposit: async (body: DepositRequest): Promise<DepositResponse> => {
    return makeRequest("/wallets/deposit", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};
