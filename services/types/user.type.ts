export enum UserRole {
  Customer = "customer",
  Supplier = "supplier",
  SystemOperator = "system_operator",
  Admin = "admin",
  SuperAdmin = "super_admin",
}

export enum UserStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Suspended = "SUSPENDED",
  Deleted = "DELETED",
  Banned = "BANNED",
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  avatarUrl?: string;
  coverUrl?: string;
  address?: string;
  birthDate?: string;
  images?: string;
  phoneNumber?: string;
  isVerified: boolean;
  isIdentified: boolean;
  reputation: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
