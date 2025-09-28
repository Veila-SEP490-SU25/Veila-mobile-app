export enum UserRole {
  Customer = "CUSTOMER",
  Supplier = "SUPPLIER",
  SystemOperator = "SYSTEM_OPERATOR",
  Admin = "ADMIN",
  SuperAdmin = "SUPER_ADMIN",
}

export enum UserStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Suspended = "SUSPENDED",
  Deleted = "DELETED",
  Banned = "BANNED",
}

export enum PhoneVerificationStatus {
  NotVerified = "NOT_VERIFIED",
  Pending = "PENDING",
  Verified = "VERIFIED",
  Failed = "FAILED",
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  address?: string;
  birthDate?: string;
  images?: string;
  role: UserRole;
  status: UserStatus;
  reputation?: number;
  isVerified: boolean;
  isIdentified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  phoneVerificationStatus?: PhoneVerificationStatus;
  favDresses?: string[];
  favShops?: string[];
}
