export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  customerName: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  dueDate: string;
  returnDate: string | null;
  amount: string;
  type: "SELL" | "RENT" | "CUSTOM";
  status: "PENDING" | "IN_PROCESS" | "COMPLETED" | "CANCELLED" | string;
  customer: {
    id: string;
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
    birthDate: string;
    avatarUrl: string | null;
    coverUrl: string;
    favDresses: string[];
    favShops: string[];
    role: string;
    status: string;
    reputation: number;
    isVerified: boolean;
    isIdentified: boolean;
  };
  shop: {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    logoUrl: string;
    coverUrl: string;
    status: string;
    reputation: number;
    isVerified: boolean;
  };
}

export interface OrderListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Order[];
}
