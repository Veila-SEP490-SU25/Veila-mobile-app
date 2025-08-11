export type DressStatus = "AVAILABLE" | "UNAVAILABLE" | "OUT_OF_STOCK";

export interface DressCategory {
  id: string;
  name: string;
  images: string[] | null;
  description: string;
  type: string; // e.g., "DRESS"
}

export interface DressShop {
  id: string;
  name: string;
  address: string;
  logoUrl: string;
  reputation: number;
}

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
  user?: { shop?: DressShop };
  category?: DressCategory;
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
