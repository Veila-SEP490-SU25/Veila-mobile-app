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
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} from "../services/apis";
import {
  IGoogleLogin,
  ILogin,
  IUpdateAddress,
  IUpdateProfile,
  IUser,
  IVerifyOtp,
  PhoneVerificationStatus,
} from "../services/types";
import { showLoginError, showMessage } from "../utils/message.util";

type AuthContextType = {
  login: (body: ILogin) => Promise<void>;
  googleLogin: (body: IGoogleLogin) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (body: IVerifyOtp) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: IUpdateProfile | IUpdateAddress) => Promise<boolean>;
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
  const [updateProfileMutation] = useUpdateProfileMutation();

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  const convertApiResponseToUser = (apiUser: any): IUser => {

    let phoneVerificationStatus: PhoneVerificationStatus =
      PhoneVerificationStatus.NotVerified;

    if (apiUser.phone) {
      if (apiUser.isIdentified) {
        phoneVerificationStatus = PhoneVerificationStatus.Verified;
      } else {
        phoneVerificationStatus = PhoneVerificationStatus.Pending;
      }
    }

    return {
      id: apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      firstName: apiUser.firstName,
      middleName: apiUser.middleName,
      lastName: apiUser.lastName,
      phone: apiUser.phone,
      avatarUrl: apiUser.avatarUrl,
      coverUrl: apiUser.coverUrl,
      address: apiUser.address,
      birthDate: apiUser.birthDate,
      images: apiUser.images,
      role: apiUser.role as any,
      status: apiUser.status as any,
      reputation: apiUser.reputation,
      isVerified: apiUser.isVerified,
      isIdentified: apiUser.isIdentified,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt,
      deletedAt: apiUser.deletedAt,
      phoneVerificationStatus,
    };
  };

  const updateUser = useCallback(
    async (data: IUpdateProfile | IUpdateAddress): Promise<boolean> => {
      try {
        let response;

        if ("provinceId" in data || "districtId" in data || "wardId" in data) {

          const addressData: IUpdateProfile = {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            address: data.fullAddress || data.streetAddress || "",
          };
          response = await updateProfileMutation(addressData).unwrap();
        } else {

          response = await updateProfileMutation(
            data as IUpdateProfile
          ).unwrap();
        }

        if (response.statusCode === 200 && response.item) {
          const updatedUser = convertApiResponseToUser(response.item);
          setUser(updatedUser);
          await setToLocalStorage("user", updatedUser);

          showMessage("SUC004");

          return true;
        } else {
          throw new Error(response.message || "Failed to update user");
        }
      } catch {
        showMessage("ERM006");
        return false;
      }
    },
    [updateProfileMutation, user]
  );

  const handleLogout = useCallback(async () => {
    try {

      const token = await getAccessToken();
      if (token) {
        await logoutMutation().unwrap();
      }
    } catch (error) {
      if (__DEV__) {
        console.log("Lỗi logout API:", error);
      }
    } finally {

      setUser(null);
      setIsAuthenticated(false);
      hasRefreshed.current = false;
      await delTokens();
      resetSession();

      setTimeout(() => {
        router.replace("/_auth/login");
      }, 100);

    }
  }, [logoutMutation, router, resetSession]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await getMe().unwrap();

      if (response.statusCode === 200 && response.item) {
        const userData = convertApiResponseToUser(response.item);
        setUser(userData);
        setIsAuthenticated(true);
        await setToLocalStorage("user", userData);
        resetSession();
      } else {
        throw new Error(response.message || "Failed to fetch user data");
      }
    } catch (error) {
      if (__DEV__) {
        console.log("Lỗi fetch user:", error?.toString());
      }

      setUser(null);
      setIsAuthenticated(false);
      await delTokens();
      router.replace("/_auth/login");
    }
  }, [getMe, router, resetSession]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getMe().unwrap();

      if (response.statusCode === 200 && response.item) {
        const userData = convertApiResponseToUser(response.item);
        setUser(userData);
        await setToLocalStorage("user", userData);
      } else {
        throw new Error(response.message || "Failed to refresh user data");
      }
    } catch (error) {
      if (__DEV__) {
        console.log("Lỗi refresh user:", error?.toString());
      }
    }
  }, [getMe]);

  const login = useCallback(
    async (body: ILogin) => {
      try {
        setIsAuthenticating(true);
        const { item, statusCode } = await loginMutation(body).unwrap();

        if (statusCode === 200) {
          const { accessToken, refreshToken } = item;
          await saveTokens(accessToken, refreshToken);
          await fetchUser();
          resetSession();

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
          showLoginError();
        }
      } catch {
        showLoginError();
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
        const { item, statusCode } = await googleLoginMutation(body).unwrap();

        if (statusCode === 200) {
          const { accessToken, refreshToken } = item;
          await saveTokens(accessToken, refreshToken);
          await fetchUser();
          resetSession();

          router.replace("/_tab/home");
        } else {
          showLoginError();
        }
      } catch {
        showLoginError();
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
        const { item, statusCode } = await verifyOtpMutation(body).unwrap();

        if (statusCode === 200) {
          const { accessToken, refreshToken } = item;
          await saveTokens(accessToken, refreshToken);
          await fetchUser();
          resetSession();

          router.replace("/_tab/home");
        } else {
          showMessage("ERM003");
        }
      } catch {
        showMessage("ERM003");
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
          if (__DEV__) {
            console.log(
              "Token hết hạn trong AuthProvider, đang thử refresh..."
            );
          }
          hasRefreshed.current = true;
          try {

            const refreshToken = await getRefreshToken();
            if (refreshToken) {
              const refreshResult = await refreshTokenMutation({
                refreshToken,
              }).unwrap();
              if (refreshResult.statusCode === 200 && refreshResult.item) {
                if (__DEV__) {
                  console.log("Refresh token thành công trong AuthProvider");
                }
                await saveTokens(
                  refreshResult.item.accessToken,
                  refreshResult.item.refreshToken
                );
                await fetchUser();
              } else {
                if (__DEV__) {
                  console.log("Refresh token thất bại trong AuthProvider");
                }
                await delTokens();

              }
            } else {
              if (__DEV__) {
                console.log("Không có refresh token trong AuthProvider");
              }
              await delTokens();

            }
          } catch (refreshError) {
            if (__DEV__) {
              console.log(
                "Lỗi refresh token trong AuthProvider:",
                refreshError
              );
            }
            await delTokens();

          }
        } else if (!access) {
          if (__DEV__) {
            console.log("Không có token trong AuthProvider");
          }

        }
      } catch (error) {
        if (__DEV__) {
          console.log(
            "Lỗi kiểm tra token trong AuthProvider:",
            error?.toString()
          );
        }
        await delTokens();

      } finally {
        setIsAuthChecking(false);
      }
    };
    init();
  }, [fetchUser, refreshTokenMutation]);

  useEffect(() => {
    if (user) {
      hasRefreshed.current = false;
    }
  }, [user]);

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
        updateUser,
        user,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
