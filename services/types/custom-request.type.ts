export interface CustomRequest {
  id: string;
  title: string;
  description: string;
  images: string | null;
  height: number;
  weight: number;
  bust: number;
  waist: number;
  hip: number;
  armpit: number;
  bicep: number;
  neck: number;
  shoulderWidth: number;
  sleeveLength: number;
  backLength: number;
  lowerWaist: number;
  waistToFloor: number;
  status: "DRAFT" | "SUBMIT";
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomRequestCreate {
  title: string;
  description: string;
  images?: string;
  height: number;
  weight: number;
  bust: number;
  waist: number;
  hip: number;
  armpit: number;
  bicep: number;
  neck: number;
  shoulderWidth: number;
  sleeveLength: number;
  backLength: number;
  lowerWaist: number;
  waistToFloor: number;
  status?: "DRAFT" | "SUBMIT";
  isPrivate?: boolean;
}

export interface CustomRequestUpdate extends Partial<CustomRequestCreate> {}

export interface CustomRequestResponse {
  message: string;
  statusCode: 200 | 201;
  item: CustomRequest;
}

export interface CustomRequestListResponse {
  message: string;
  statusCode: 200 | 201;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: CustomRequest[];
}
