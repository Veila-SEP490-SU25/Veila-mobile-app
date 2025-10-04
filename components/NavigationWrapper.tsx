import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useAuth } from "../providers/auth.provider";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export const NavigationWrapper: React.FC<NavigationWrapperProps> = ({
  children,
}) => {
  const router = useRouter();
  const { setNavigationCallback } = useAuth();

  useEffect(() => {
    setNavigationCallback((path: string) => {
      if (path.includes("?")) {
        const [pathname, searchParams] = path.split("?");
        const params = new URLSearchParams(searchParams);
        const paramsObj: Record<string, string> = {};
        params.forEach((value, key) => {
          paramsObj[key] = value;
        });
        router.push({
          pathname: pathname as any,
          params: paramsObj,
        });
      } else {
        router.replace(path as any);
      }
    });
  }, [router, setNavigationCallback]);

  return <>{children}</>;
};

