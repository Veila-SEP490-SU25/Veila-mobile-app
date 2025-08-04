import { jwtDecode } from "jwt-decode";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "../utils/local-storage.util";

type JwtPayload = { exp: number; [key: string]: any };

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

export const isAccessTokenValid = async (): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

export const getAccessToken = async () => {
  return await getFromLocalStorage<string>("accessToken", false);
};

export const getRefreshToken = async () => {
  return await getFromLocalStorage<string>("refreshToken", false);
};

export const setAccessToken = async (token: string) => {
  await setToLocalStorage<string>("accessToken", token, false);
};

export const setRefreshToken = async (token: string) => {
  await setToLocalStorage<string>("refreshToken", token, false);
};

export const delAccessToken = async () => {
  await removeFromLocalStorage("accessToken");
};

export const delRefreshToken = async () => {
  await removeFromLocalStorage("refreshToken");
};

export const getTokens = async () => {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);
  return { accessToken, refreshToken };
};

export const setTokens = async (accessToken: string, refreshToken: string) => {
  await setAccessToken(accessToken);
  await setRefreshToken(refreshToken);
};

export const delTokens = async () => {
  await delAccessToken();
  await delRefreshToken();
};
