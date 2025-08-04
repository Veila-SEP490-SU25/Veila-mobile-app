import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import toast from "react-native-toast-message";
import { IItemResponse, IToken } from "../../services/types";
import {
  clearLocalStorage,
  getTokens,
  getVeilaServerConfig,
  setTokens,
} from "../../utils";

const API_URL = getVeilaServerConfig();

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers) => {
    const { accessToken } = await getTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const toastError = (title: string, description?: string) => {
  toast.show({
    type: "error",
    text1: title,
    text2: description,
  });
};

export const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const errData = result.error.data as { message?: string } | undefined;
    toastError("Đã xảy ra lỗi", errData?.message || "Unknown error");
    return result;
  }

  const data = result.data as Partial<IItemResponse<unknown>> | undefined;

  if (data?.statusCode === 401 && data.message?.includes("hết hạn")) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      toastError("Không tìm thấy refresh token");
      clearLocalStorage();
      router.replace("/_auth/login");
      return result;
    }

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    const refreshData = refreshResult.data as
      | Partial<IItemResponse<IToken>>
      | undefined;

    if (refreshData?.statusCode === 200 && refreshData.item) {
      setTokens(refreshData.item.accessToken, refreshData.item.refreshToken);

      result = await baseQuery(args, api, extraOptions);
    } else {
      toastError("Phiên đăng nhập hết hạn", refreshData?.message);
      clearLocalStorage();
      router.replace("/_auth/login");
    }
  }

  return result;
};
