import { router } from "expo-router";

export const useAppNavigation = () => {
  const navigate = (route: string) => {
    try {
      if (route.startsWith("/")) {
        router.push(route as any);
      } else {
        router.push(`/${route}` as any);
      }
    } catch (error) {
      console.warn("Navigation error:", error);

      setTimeout(() => {
        try {
          if (route.startsWith("/")) {
            router.push(route as any);
          } else {
            router.push(`/${route}` as any);
          }
        } catch (fallbackError) {
          console.error("Fallback navigation failed:", fallbackError);
        }
      }, 100);
    }
  };

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

  return { navigate, goBack, replace };
};
