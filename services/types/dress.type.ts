export type DressStatus = "AVAILABLE" | "UNAVAILABLE" | "OUT_OF_STOCK";

export interface DressCategory {
  id: string;
  name: string;
  images: string[] | null;
  description: string;
  type: string;
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
  ratingAverage: string;
  sellPrice: string;
  rentalPrice: string;
  isSellable: boolean;
  isRentable: boolean;
  status: DressStatus;
  user?: { shop?: DressShop };
  category?: DressCategory;
  description?: string;
  ratingCount?: number;
  feedbacks?: Array<{
    id: string;
    customer: { id: string; username: string; avatarUrl: string | null };
    content: string;
    rating: string;
    images: string | null;
  }>;
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
