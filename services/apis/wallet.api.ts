import { getTokens, getVeilaServerConfig } from "../../utils";
import { WalletResponse } from "../types/wallet.type";

const API_URL = getVeilaServerConfig();

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const { accessToken } = await getTokens();

  const fullUrl = `${API_URL}${endpoint}`;
  const requestOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  const response = await fetch(fullUrl, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  return response.json();
};

export interface DepositRequest {
  amount: number;
  note: string;
}

export interface UpdateWalletRequest {
  pin?: string;
}

export interface CreatePinRequest {
  pin: string;
}

export interface UpdatePinRequest {
  oldPin: string;
  pin: string;
}

export interface UpdateBankInfoRequest {
  bin: string;
  bankNumber: string;
}

export interface RequestSmartOtpRequest {
  pin: string;
}

export interface RequestSmartOtpResponse {
  message: string;
  statusCode: number;
  item: string;
}

export interface WithdrawRequest {
  amount: number;
  note: string;
  otp: string;
}

export interface WithdrawResponse {
  message: string;
  statusCode: number;
  item?: any;
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
  updateWallet: async (body: UpdateWalletRequest): Promise<WalletResponse> => {
    return makeRequest("/wallets/my-wallet", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  createPin: async (body: CreatePinRequest): Promise<WalletResponse> => {
    return makeRequest("/wallets/my-wallet/create-pin", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  updatePin: async (body: UpdatePinRequest): Promise<WalletResponse> => {
    return makeRequest("/wallets/my-wallet/update-pin", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  updateBankInfo: async (
    body: UpdateBankInfoRequest
  ): Promise<WalletResponse> => {
    return makeRequest("/wallets/update-bank-information", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  requestSmartOtp: async (
    body: RequestSmartOtpRequest
  ): Promise<RequestSmartOtpResponse> => {
    return makeRequest("/wallets/request-smart-otp", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  withdrawRequest: async (body: WithdrawRequest): Promise<WithdrawResponse> => {
    return makeRequest("/wallets/withdraw-request", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  paymentWebhook: async (body: any): Promise<any> => {
    return makeRequest("/wallets/payment/webhook", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
