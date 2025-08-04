export interface IContract {
  id: string;
  images: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  content: string;
  contractType: "CUSTOMER" | "SUPPLIER";
  effectiveFrom: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface IContractResponse {
  message: string;
  statusCode: number;
  item: IContract;
}
