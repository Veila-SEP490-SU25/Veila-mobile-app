export interface CustomRequest {
  id: string;
  images: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  description: string;
  high: number;
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
  dressStyle: string;
  curtainNeckline: string;
  sleeveStyle: string;
  material: string;
  color: string;
  specialElement: string;
  coverage: string;
  status: "DRAFT" | "SUBMIT";

  isPrivate: boolean;
}

export interface CustomRequestCreate {
  title: string;
  description: string;
  images?: string;
  high: number;
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
  dressStyle: string;
  curtainNeckline: string;
  sleeveStyle: string;
  material: string;
  color: string;
  specialElement: string;
  coverage: string;
  isPrivate?: boolean;
  status?: "DRAFT" | "SUBMIT";
}

export interface CustomRequestUpdate extends Partial<CustomRequestCreate> {}

export interface CustomRequestResponse {
  message: string;
  statusCode: number;
  item: CustomRequest;
}

export interface CustomRequestListResponse {
  message: string;
  statusCode: number;
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: CustomRequest[];
}
