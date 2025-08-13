export interface IToken {
  accessToken: string;
  refreshToken: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IGoogleLogin {
  email: string;
  fullname: string;
}

export interface IRegister {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  agreeToTerms: boolean;
}

export interface IRequestOtp {
  email: string;
}

export interface IVerifyOtp {
  userId: string;
  otp: string;
}

export interface IRequestResetPassword {
  email: string;
}

export interface IResetPassword {
  userId: string;
  otp: string;
  newPassword: string;
}

export interface IUpdateProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  address?: string;
  birthDate?: string;
  avatarUrl?: string;
  coverUrl?: string;
  images?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Firebase Phone Auth interfaces
export interface IPhoneVerification {
  phone: string;
  verificationId?: string;
  code?: string;
}

export interface IPhoneVerificationResponse {
  message: string;
  statusCode: number;
  item: null;
}

export interface IFirebasePhoneAuth {
  phone: string;
  verificationId: string;
  code: string;
}

// API Response types
export interface IApiResponse<T> {
  message: string;
  statusCode: number;
  item: T;
}

export interface IUserResponse {
  message: string;
  statusCode: number;
  item: {
    id: string;
    images?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    username: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    avatarUrl?: string;
    coverUrl?: string;
    role: string;
    status: string;
    reputation?: number;
    isVerified: boolean;
    isIdentified: boolean;
  };
}
