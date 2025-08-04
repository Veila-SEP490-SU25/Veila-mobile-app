import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { checkAccessToken, isTokenExpired } from "../utils";

export const useTokenCheck = () => {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;

    const checkToken = async () => {
      try {
        const token = await checkAccessToken();
        if (!token || isTokenExpired(token)) {
          console.log("Token hết hạn hoặc không tồn tại, chuyển về login");
          router.replace("/_auth/login");
          return;
        }
        console.log("Token hợp lệ");
      } catch (error) {
        console.log("Lỗi kiểm tra token:", error);
        router.replace("/_auth/login");
      } finally {
        hasChecked.current = true;
      }
    };

    checkToken();
  }, []);
};
