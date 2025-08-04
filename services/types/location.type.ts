export interface IProvince {
  id: string;
  name: string;
  type: number;
  typeText: string;
  slug: string;
}

export interface IDistrict {
  id: string;
  name: string;
  type: number;
  typeText: string;
  slug: string;
}

export interface IWard {
  id: string;
  name: string;
  type: number;
  typeText: string;
  slug: string;
}

export interface ILocationResponse<T> {
  total: number;
  data: T[];
  code: string;
  message: string | null;
}

export interface IAddress {
  province: IProvince | null;
  district: IDistrict | null;
  ward: IWard | null;
  streetAddress: string;
}
