import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "../utils/local-storage.util";

export const getAccessToken = () => {
  return getFromLocalStorage<string>("accessToken");
};

export const getRefreshToken = () => {
  return getFromLocalStorage<string>("refreshToken");
};

export const setAccessToken = (token: string) => {
  setToLocalStorage<string>("accessToken", token);
};

export const setRefreshToken = (token: string) => {
  setToLocalStorage<string>("refreshToken", token);
};

export const delAccessToken = () => {
  removeFromLocalStorage("accessToken");
};

export const delRefreshToken = () => {
  removeFromLocalStorage("refreshToken");
};

export const getTokens = () => {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};

export const delTokens = () => {
  delAccessToken();
  delRefreshToken();
};
