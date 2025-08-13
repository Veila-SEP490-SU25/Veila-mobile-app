import { router } from "expo-router";
import React, { createContext, useCallback, useContext } from "react";

interface NavigationContextType {
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  replace: (route: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useCallback((route: string, _params?: any) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, []);

  const goBack = () => {
    try {
      router.back();
    } catch (error) {
      console.warn("Go back error:", error);
    }
  };

  const replace = (route: string) => {
    try {
      if (route.startsWith("/")) {
        router.replace(route as any);
      } else {
        router.replace(`/${route}` as any);
      }
    } catch (error) {
      console.warn("Replace error:", error);
    }
  };

  return (
    <NavigationContext.Provider value={{ navigate, goBack, replace }}>
      {children}
    </NavigationContext.Provider>
  );
};
