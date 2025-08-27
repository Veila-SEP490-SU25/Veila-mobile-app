import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import toast from "react-native-toast-message";
import { IItemResponse, IToken } from "../../services/types";
import { getTokens, getVeilaServerConfig, setTokens } from "../../utils";

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

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && !isRefreshing) {

    const isRefreshRequest =
      typeof args === "object" && args.url === "/auth/refresh-token";

    if (isRefreshRequest) {
      console.log("Đây là request refresh token, không thử refresh nữa");
      return result;
    }

    if (refreshPromise) {
      console.log("Đang đợi refresh token hoàn thành...");
      await refreshPromise;

      result = await baseQuery(args, api, extraOptions);
      return result;
    }

    isRefreshing = true;
    console.log("Bắt đầu refresh token từ base query...");

    refreshPromise = (async () => {
      try {

        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.log("Không tìm thấy refresh token");
          return false;
        }

        console.log("Đang thử refresh token từ base query...");

        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.error) {
          console.log(
            "Refresh token thất bại từ base query:",
            refreshResult.error
          );
          return false;
        }

        const refreshData = refreshResult.data as
          | Partial<IItemResponse<IToken>>
          | undefined;

        if (refreshData?.statusCode === 200 && refreshData.item) {
          console.log(
            "Refresh token thành công từ base query, đang lưu token mới"
          );

          await setTokens(
            refreshData.item.accessToken,
            refreshData.item.refreshToken
          );
          return true;
        } else {
          console.log(
            "Refresh token response không hợp lệ từ base query:",
            refreshData
          );
          return false;
        }
      } catch (error) {
        console.log("Lỗi trong quá trình refresh token từ base query:", error);
        return false;
      }
    })();

    try {
      const refreshSuccess = await refreshPromise;

      if (refreshSuccess) {

        console.log("Đang thử lại request ban đầu...");
        result = await baseQuery(args, api, extraOptions);

        if (result.error) {
          console.log("Request sau refresh vẫn thất bại:", result.error);
        } else {
          console.log("Request sau refresh thành công");
        }
      } else {
        console.log("Refresh token thất bại, không thử lại request");
      }
    } finally {
      isRefreshing = false;
      refreshPromise = null;
      console.log("Kết thúc refresh token từ base query");
    }
  }

  return result;
};
