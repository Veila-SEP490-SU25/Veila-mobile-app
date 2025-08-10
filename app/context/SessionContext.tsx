import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const SessionContext = createContext({
  sessionExpired: false,
  setSessionExpired: () => {},
});

const publicRoutes = [
  "/_auth/login",
  "/_auth/register",
  "/_auth/forgot-password",
  "/",
];

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      if (publicRoutes.includes(pathname)) return;

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setSessionExpired(true);
      }
    };

    checkToken();
  }, [pathname]);

  const handleOk = () => {
    setSessionExpired(false);
    AsyncStorage.removeItem("token");
    router.replace("/_auth/login");
  };

  return (
    <SessionContext.Provider
      value={{
        sessionExpired,
        setSessionExpired: () => setSessionExpired(true),
      }}
    >
      {children}

      <Modal visible={sessionExpired} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-80 shadow-lg">
            <Text className="text-lg font-bold mb-3 text-gray-700 text-center">
              Phiên đăng nhập đã hết hạn
            </Text>
            <TouchableOpacity
              className="bg-primary-500 py-2 rounded-xl mt-4"
              onPress={handleOk}
            >
              <Text className="text-white font-semibold text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SessionContext.Provider>
  );
};
