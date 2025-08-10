import { useEffect, useRef, useState } from "react";
import { checkAccessToken, isTokenExpired } from "../utils";

export const useTokenCheck = () => {
  const hasChecked = useRef(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (hasChecked.current) return;

    const checkToken = async () => {
      try {
        const token = await checkAccessToken();
        if (!token || isTokenExpired(token)) {
          console.log("Phiên đăng nhập hết hạn");
          setSessionExpired(true);
          return;
        }
        console.log("Token hợp lệ");
      } catch (error) {
        console.log("Lỗi kiểm tra token:", error);
        setSessionExpired(true);
      } finally {
        hasChecked.current = true;
      }
    };

    checkToken();
  }, []);
  return { sessionExpired, setSessionExpired };
};
