export interface IToken {
  accessToken: string;
  refreshToken: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
}

export interface IRequestOtp {
  email: string;
}

export interface IVerifyOtp {
  userId: string;
  otp: string;
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
