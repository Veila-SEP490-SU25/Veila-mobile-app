export interface Order {
  id: string;
  customerName: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  dueDate: string;
  returnDate: string;
  isBuyBack: boolean;
  amount: number;
  type: "SELL" | "RENT" | "CUSTOM";
  status: "PENDING" | "IN_PROCESS" | "COMPLETED" | "CANCELLED" | string;
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
