import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const rawKeys = ["accessToken", "refreshToken"];

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

export async function getFromLocalStorage<T>(
  key: string,
  parse = !rawKeys.includes(key)
): Promise<T | string | null> {
  try {
    const item = await AsyncStorage.getItem(key);
    if (!item) return null;
    return parse ? (JSON.parse(item) as T) : item;
  } catch (error) {
    console.error(`Error getting AsyncStorage item "${key}":`, error);
    return null;
  }
}

export async function setToLocalStorage<T>(
  key: string,
  value: T,
  stringify = true
): Promise<void> {
  try {
    if (value === undefined || value === null) {
      console.warn(
        `setToLocalStorage: value for key "${key}" is ${value}, removing instead.`
      );
      await AsyncStorage.removeItem(key);
      return;
    }

    const val = stringify ? JSON.stringify(value) : (value as string);
    await AsyncStorage.setItem(key, val);
  } catch (error) {
    console.error(`Error setting AsyncStorage item "${key}":`, error);
  }
}

export async function removeFromLocalStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing AsyncStorage item "${key}":`, error);
  }
}

export async function clearLocalStorage(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
}

export async function checkAccessToken(): Promise<string | null> {
  const token = await getFromLocalStorage<string>("accessToken", false);
  if (!token) {
    console.warn("No accessToken found");
    return null;
  }
  return token;
}

export async function checkRefreshToken(): Promise<string | null> {
  const token = await getFromLocalStorage<string>("refreshToken");
  if (!token) {
    console.warn("No refreshToken found");
    return null;
  }
  return token;
}
