import { IItemResponse, IToken } from "../../services/types";
import {
  clearLocalStorage,
  getTokens,
  getVeilaServerConfig,
  setTokens,
} from "../../utils";
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import toast from "react-native-toast-message";

const API_URL = getVeilaServerConfig();

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  },
});

const toastError = (title: string, description?: string) => {
  return toast.show({
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
    toastError("Đã xảy ra lỗi", result.error.data as string);
  } else {
    const { statusCode, message } = result.data as IItemResponse<null>;
    if (statusCode === 401) {
      if (message.includes("hết hạn.")) {
        const refreshToken = getTokens().refreshToken;
        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: "/auth/refresh-token",
              method: "POST",
              body: { refreshToken },
            },
            api,
            extraOptions
          );
          const { statusCode, message, item } =
            refreshResult.data as IItemResponse<IToken>;
          if (statusCode === 200) {
            setTokens(item.accessToken, item.refreshToken);
            result = await baseQuery(args, api, extraOptions);
          } else {
            toastError("Đã xảy ra lỗi", message);
            clearLocalStorage();
            window.location.href = "/";
          }
        }
      }
    }
  }
  return result;
};
