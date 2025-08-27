import { getTokens, getVeilaServerConfig } from "../../utils";

export interface TransactionParams {
  filter?: string;
  sort?: string;
  size?: number;
  page?: number;
}

export interface TransactionWalletInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  availableBalance: string;
  lockedBalance: string;
  bin: string;
  bankNumber: string;
}

export interface TransactionOrderInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  phone: string;
  email: string;
  address: string;
  dueDate: string | null;
  returnDate: string | null;
  amount: string;
  type: "SELL" | "RENT" | "CUSTOM";
  status: "PENDING" | "IN_PROCESS" | "COMPLETED" | "CANCELLED" | string;
}

export interface TransactionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  from: string;
  to: string;
  fromTypeBalance: "available" | "locked" | string;
  toTypeBalance: "available" | "locked" | string;
  amount: string;
  type: "transfer" | string;
  status: "completed" | "pending" | "failed" | string;
  note: string | null;
  wallet: TransactionWalletInfo;
  order: TransactionOrderInfo | null;
  membership: any;
  walletId: string;
  orderId: string | null;
  membershipId: string | null;
}

export interface TransactionPage {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: TransactionItem[];
}

export interface TransactionDetailResponse {
  message: string;
  statusCode: number;
  items: TransactionItem;
}

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

export const transactionApi = {
  getMyTransactions: async (
    params: TransactionParams = {}
  ): Promise<TransactionPage> => {
    const searchParams = new URLSearchParams();

    if (params.filter) searchParams.append("filter", params.filter);
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return makeRequest(`/transactions/my-transaction${query}`);
  },

  getTransactionDetail: async (
    id: string
  ): Promise<TransactionDetailResponse> => {
    return makeRequest(`/transactions/${id}`);
  },
};
