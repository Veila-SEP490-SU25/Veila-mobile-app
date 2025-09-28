import { usePathname, useRouter } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import {
  delTokens,
  getAccessToken,
  isTokenExpired,
} from "../../utils/token.util";

const SessionContext = createContext({
  sessionExpired: false,
  setSessionExpired: () => {},
  resetSession: () => {},
});

const publicRoutes = [
  "/_auth/login",
  "/_auth/register",
  "/_auth/forgot-password",
  "/",
];

export const useSession = () => useContext(SessionContext);

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionExpired, setSessionExpired] = useState(false);
  const hasChecked = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      if (publicRoutes.includes(pathname)) {
        setSessionExpired(false);
        hasChecked.current = false;
        return;
      }

      if (hasChecked.current) return;
      hasChecked.current = true;

      await new Promise((resolve) => setTimeout(resolve, 800));

      try {
        const token = await getAccessToken();
        if (!token || isTokenExpired(token)) {
          console.log("Token không hợp lệ hoặc hết hạn");
          setSessionExpired(true);
        } else {
          console.log("Token hợp lệ ");
          setSessionExpired(false);
        }
      } catch (error) {
        console.log("Lỗi kiểm tra token", error);
        setSessionExpired(true);
      }
    };

    checkToken();
  }, [pathname]);

  const handleOk = () => {
    setSessionExpired(false);
    hasChecked.current = false;
    delTokens();

    setTimeout(() => {
      router.replace("/_auth/login");
    }, 100);
  };

  const resetSession = () => {
    setSessionExpired(false);
    hasChecked.current = false;
  };

  return (
    <SessionContext.Provider
      value={{
        sessionExpired,
        setSessionExpired: () => setSessionExpired(true),
        resetSession,
      }}
    >
      {children}

      <Modal visible={sessionExpired} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-80 shadow-lg">
            <Text className="text-lg font-bold mb-3 text-gray-700 text-center">
              Phiên đăng nhập đã hết hạn.
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              Vui lòng đăng nhập lại.
            </Text>
            <TouchableOpacity
              className="bg-primary-500 py-3 rounded-xl mt-2"
              onPress={handleOk}
            >
              <Text className="text-white font-semibold text-center">
                Đăng nhập lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SessionContext.Provider>
  );
}
