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
