// /api/shops;
export interface Shop {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  coverUrl: string;
  images: string[] | null;
}

export interface ShopListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Shop[];
}

// /api/shops / { id };
export interface ShopDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  images: string[] | null;
  logoUrl: string;
  coverUrl: string;
}

// /api/shops / { id } / accessories;
export interface Accessory {
  id: string;
  images: string[] | null;
  name: string;
  sellPrice: string;
  rentalPrice: string;
  isSellable: boolean;
  isRentable: boolean;
  ratingAverage: string;
  status: "AVAILABLE" | "UNAVAILABLE" | string;
  user?: { shop?: Shop };
}

export interface AccessoryListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Accessory[];
}

// /api/shops / { id } / categories;
export type CategoryType = "SERVICE" | "ACCESSORY" | "DRESS" | "BLOG";

export interface Category {
  id: string;
  name: string;
  images: string[] | null;
  type: CategoryType;
}

export interface CategoryListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Category[];
}

// /api/shops/{id}/services
export type ServiceStatus = "AVAILABLE" | "UNAVAILABLE";

export interface Service {
  id: string;
  name: string;
  images: string[] | null;
  ratingAverage: string;
  status: ServiceStatus;
}

export interface ServiceListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Service[];
}

// /api/shops/{id}/dresses
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

// /api/shops / { id } / blogs;
export interface Blog {
  id: string;
  title: string;
  images: string[] | null;
}

export interface BlogListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: Blog[];
}

export interface BlogDetail {
  id: string;
  images: string[] | null;
  title: string;
  content: string;
}
