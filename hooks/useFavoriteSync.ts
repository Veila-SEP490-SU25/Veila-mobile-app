import { useCallback } from "react";
import { useAuth } from "../providers/auth.provider";

export const useFavoriteSync = () => {
  const { user, refreshUser } = useAuth();

  const isDressFavorite = useCallback(
    (dressId: string): boolean => {
      return user?.favDresses?.includes(dressId) || false;
    },
    [user?.favDresses]
  );

  const isShopFavorite = useCallback(
    (shopId: string): boolean => {
      return user?.favShops?.includes(shopId) || false;
    },
    [user?.favShops]
  );

  const syncFavoriteStatus = useCallback(
    async (itemId: string, type: "dress" | "shop", isFavorite: boolean) => {
      try {
        // Update local state immediately for better UX
        // The actual API call should be made in the component
        
        // Refresh user data to sync with backend
        await refreshUser();
      } catch (error) {
        console.error("Error syncing favorite status:", error);
      }
    },
    [refreshUser]
  );

  return {
    isDressFavorite,
    isShopFavorite,
    syncFavoriteStatus,
    user,
  };
};
