import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import {
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "../services/apis";
import { ILogin, IUser, IVerifyOtp } from "../services/types";

type AuthContextType = {
  login: (body: ILogin) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (body: IVerifyOtp) => Promise<void>;
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [requestOtpMutation] = useRequestOtpMutation();
  const [getMe, { isFetching: isGetMeLoading }] = useLazyGetMeQuery();

  const saveTokens = async (access: string, refresh: string) => {
    await AsyncStorage.setItem("accessToken", access);
    await AsyncStorage.setItem("refreshToken", refresh);
  };

  const clearTokens = async () => {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
  };

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
    } finally {
      await clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/_auth/login");
      Toast.show({ type: "success", text1: "Đăng xuất thành công" });
    }
  }, [logoutMutation, router]);

  const fetchUser = useCallback(async () => {
    try {
      const { item } = await getMe().unwrap();
      setUser(item);
      setIsAuthenticated(true);
      await AsyncStorage.setItem("user", JSON.stringify(item));
    } catch {
      await logout();
    }
  }, [getMe, logout]);

  const login = useCallback(
    async (body: ILogin) => {
      try {
        setIsAuthenticating(true);
        const { item, statusCode, message } =
          await loginMutation(body).unwrap();

        if (statusCode === 200) {
          const { accessToken, refreshToken } = item;
          await saveTokens(accessToken, refreshToken);
          await fetchUser();
          Toast.show({ type: "success", text1: "Đăng nhập thành công" });
          router.replace("/");
        } else if (statusCode === 401) {
          const { item: otpUserId } = await requestOtpMutation({
            email: body.email,
          }).unwrap();
          router.push({
            pathname: "/_auth/verify-otp",
            params: { userId: otpUserId, email: body.email },
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Đăng nhập thất bại",
            text2: message,
          });
        }
      } catch {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập",
          text2: "Vui lòng thử lại sau",
        });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [loginMutation, requestOtpMutation, router, fetchUser]
  );

  const verifyOtp = useCallback(
    async (body: IVerifyOtp) => {
      try {
        setIsAuthenticating(true);
        const { item, statusCode, message } =
          await verifyOtpMutation(body).unwrap();

        if (statusCode === 200) {
          const { accessToken, refreshToken } = item;
          await saveTokens(accessToken, refreshToken);
          await fetchUser();
          Toast.show({ type: "success", text1: "Xác thực thành công" });
          router.replace("/");
        } else {
          Toast.show({
            type: "error",
            text1: "Xác thực thất bại",
            text2: message,
          });
        }
      } catch {
        Toast.show({
          type: "error",
          text1: "Lỗi xác thực",
          text2: "Vui lòng thử lại sau",
        });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [verifyOtpMutation, router, fetchUser]
  );

  useEffect(() => {
    const init = async () => {
      const access = await AsyncStorage.getItem("accessToken");
      if (access) {
        await fetchUser();
      }
    };
    init();
  }, [fetchUser]);

  const isLoading = isGetMeLoading || isAuthenticating;

  return (
    <AuthContext.Provider
      value={{ login, logout, verifyOtp, user, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
