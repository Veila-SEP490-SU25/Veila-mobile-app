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
  address: string;
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
  availableBalance: string;
  lockedBalance: string;
  user: WalletUser;
}

export interface WalletResponse {
  message: string;
  statusCode: number;
  item: Wallet;
} 