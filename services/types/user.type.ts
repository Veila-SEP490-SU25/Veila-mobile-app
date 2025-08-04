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
  username: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string | null;
  address: string | null;
  birthDate: Date | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isVerified: boolean;
  isIdentified: boolean;
  reputation: number;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
