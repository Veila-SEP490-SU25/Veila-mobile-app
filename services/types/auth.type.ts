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
