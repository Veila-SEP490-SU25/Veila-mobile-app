export interface WalletUser {
  id: string;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  username: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  address: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  role: string;
  status: string;
  reputation: number;
  isVerified: boolean;
  isIdentified: boolean;
}

export interface Wallet {
  id: string;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  availableBalance: number | string;
  lockedBalance: number | string;
  bin?: string | null;
  bankNumber?: string | null;
  pin?: string | null;
  hasPin?: boolean;
  user: WalletUser;
}

export interface WalletResponse {
  message: string;
  statusCode: number;
  item: Wallet;
}

export interface DepositRequest {
  amount: number;
  note: string;
  returnUrl: string;
  cancelUrl: string;
}
