export enum UserRole {
  Customer = 'customer',
  Supplier = 'supplier',
  SystemOperator = 'system_operator',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Deleted = 'deleted',
  Banned = 'banned',
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
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
