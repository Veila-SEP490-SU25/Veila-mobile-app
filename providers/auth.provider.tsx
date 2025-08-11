import SplashIntroVideo from "@/index";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import {
  delTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setAccessToken,
  setRefreshToken,
  setToLocalStorage,
} from "utils";
import { useSession } from "../app/context/SessionContext";
import {
  useGoogleLoginMutation,
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "../services/apis";
import { IGoogleLogin, ILogin, IUser, IVerifyOtp } from "../services/types";

type AuthContextType = {
  login: (body: ILogin) => Promise<void>;
  googleLogin: (body: IGoogleLogin) => Promise<void>;
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
  const { resetSession } = useSession();

  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const hasRefreshed = useRef(false);

  const [loginMutation] = useLoginMutation();
  const [googleLoginMutation] = useGoogleLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [requestOtpMutation] = useRequestOtpMutation();
  const [getMe, { isFetching: isGetMeLoading }] = useLazyGetMeQuery();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const handleLogout = useCallback(async () => {
    try {
      // Thử gọi API logout nếu có token
      const token = await getAccessToken();
      if (token) {
        await logoutMutation().unwrap();
      }
    } catch (error) {
      console.log("Lỗi logout API:", error);
    } finally {
      // Luôn clear local state và tokens
      setUser(null);
      setIsAuthenticated(false);
      hasRefreshed.current = false;
      await delTokens();
      resetSession(); // Reset session context
      // Thêm delay nhỏ để tránh xung đột
      setTimeout(() => {
        router.replace("/_auth/login");
      }, 100);
      Toast.show({ type: "success", text1: "Đăng xuất thành công" });
    }
  }, [logoutMutation, router, resetSession]);

  const fetchUser = useCallback(async () => {
    try {
      const { item } = await getMe().unwrap();
      setUser(item);
      setIsAuthenticated(true);
      await setToLocalStorage("user", item);
      resetSession();
    } catch (error) {
      console.log("Lỗi fetch user:", error?.toString());

      setUser(null);
      setIsAuthenticated(false);
      await delTokens();
      router.replace("/_auth/login");
    }
  }, [getMe, router, resetSession]);

  const refreshUser = useCallback(async () => {
    try {
      const { item } = await getMe().unwrap();
      setUser(item);
      await setToLocalStorage("user", item);
    } catch (error) {
      console.log("Lỗi refresh user:", error?.toString());
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
          resetSession();
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
    [loginMutation, requestOtpMutation, router, fetchUser, resetSession]
  );

  const googleLogin = useCallback(
    async (body: IGoogleLogin) => {
      try {
        setIsAuthenticating(true);
        const { item, statusCode, message } =
          await googleLoginMutation(body).unwrap();

        if (statusCode === 200) {
          const { accessToken, refreshToken } = item;
          await saveTokens(accessToken, refreshToken);
          await fetchUser();
          resetSession();
          Toast.show({ type: "success", text1: "Đăng nhập Google thành công" });
          router.replace("/_tab/home");
        } else {
          Toast.show({
            type: "error",
            text1: "Đăng nhập Google thất bại",
            text2: message,
          });
        }
      } catch {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập Google",
          text2: "Vui lòng thử lại sau",
        });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [googleLoginMutation, router, fetchUser, resetSession]
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
          resetSession();
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
    [verifyOtpMutation, router, fetchUser, resetSession]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const access = await getAccessToken();
        if (access && !isTokenExpired(access)) {
          await fetchUser();
        } else if (access && isTokenExpired(access) && !hasRefreshed.current) {
          console.log("Token hết hạn trong AuthProvider, đang thử refresh...");
          hasRefreshed.current = true;
          try {
            // Thử refresh token
            const refreshToken = await getRefreshToken();
            if (refreshToken) {
              const refreshResult = await refreshTokenMutation({
                refreshToken,
              }).unwrap();
              if (refreshResult.statusCode === 200 && refreshResult.item) {
                console.log("Refresh token thành công trong AuthProvider");
                await saveTokens(
                  refreshResult.item.accessToken,
                  refreshResult.item.refreshToken
                );
                await fetchUser();
              } else {
                console.log("Refresh token thất bại trong AuthProvider");
                await delTokens();
                // Không redirect ngay, để SessionContext xử lý
              }
            } else {
              console.log("Không có refresh token trong AuthProvider");
              await delTokens();
              // Không redirect ngay, để SessionContext xử lý
            }
          } catch (refreshError) {
            console.log("Lỗi refresh token trong AuthProvider:", refreshError);
            await delTokens();
            // Không redirect ngay, để SessionContext xử lý
          }
        } else if (!access) {
          console.log("Không có token trong AuthProvider");
          // Không redirect ngay, để SessionContext xử lý
        }
      } catch (error) {
        console.log(
          "Lỗi kiểm tra token trong AuthProvider:",
          error?.toString()
        );
        await delTokens();
        // Không redirect ngay, để SessionContext xử lý
      } finally {
        setIsAuthChecking(false);
      }
    };
    init();
  }, [fetchUser, refreshTokenMutation]);

  // Reset refresh flag khi user thay đổi
  useEffect(() => {
    if (user) {
      hasRefreshed.current = false;
    }
  }, [user]);

  // Reset refresh flag khi logout
  const logout = useCallback(async () => {
    await handleLogout();
  }, [handleLogout]);

  const isLoading = isGetMeLoading || isAuthenticating;

  if (isAuthChecking) {
    return <SplashIntroVideo />;
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        googleLogin,
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
