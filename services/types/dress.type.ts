export type DressStatus = "AVAILABLE" | "UNAVAILABLE" | "OUT_OF_STOCK";

export interface Dress {
  id: string;
  name: string;
  images: string[] | null;
  ratingAverage: string; // có thể parse về number nếu muốn
  sellPrice: string;
  rentalPrice: string;
  isSellable: boolean;
  isRentable: boolean;
  status: DressStatus;
}

export interface DressListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Dress[];
}
