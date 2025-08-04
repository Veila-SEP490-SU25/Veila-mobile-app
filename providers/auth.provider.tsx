import SplashIntroVideo from "@/index";
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
  delTokens,
  getAccessToken,
  isTokenExpired,
  setAccessToken,
  setRefreshToken,
  setToLocalStorage,
} from "utils";
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
  refreshUser: () => Promise<void>;
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
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [requestOtpMutation] = useRequestOtpMutation();
  const [getMe, { isFetching: isGetMeLoading }] = useLazyGetMeQuery();

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      await delTokens();
      router.replace("/_auth/login");
      Toast.show({ type: "success", text1: "Đăng xuất thành công" });
    }
  }, [logoutMutation, router]);

  const fetchUser = useCallback(async () => {
    try {
      const { item } = await getMe().unwrap();
      setUser(item);
      setIsAuthenticated(true);
      await setToLocalStorage("user", item);
    } catch (error) {
      console.log("Lỗi fetch user:", error);

      setUser(null);
      setIsAuthenticated(false);
      await delTokens();
      router.replace("/_auth/login");
    }
  }, [getMe, router]);

  const refreshUser = useCallback(async () => {
    try {
      const { item } = await getMe().unwrap();
      setUser(item);
      await setToLocalStorage("user", item);
    } catch (error) {
      console.log("Lỗi refresh user:", error);
    }
  }, [getMe]);

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
          router.replace("/_tab/home");
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
          router.replace("/_tab/home");
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
      try {
        const access = await getAccessToken();
        if (access && !isTokenExpired(access)) {
          await fetchUser();
        } else {
          console.log("Token hết hạn hoặc không tồn tại trong AuthProvider");
          await delTokens();
        }
      } catch (error) {
        console.log("Lỗi kiểm tra token trong AuthProvider:", error);
        await delTokens();
      } finally {
        setIsAuthChecking(false);
      }
    };
    init();
  }, [fetchUser]);

  const isLoading = isGetMeLoading || isAuthenticating;

  if (isAuthChecking) {
    return <SplashIntroVideo />;
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        verifyOtp,
        refreshUser,
        user,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
