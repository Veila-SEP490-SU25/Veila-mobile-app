import React, { createContext, useContext, useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationService from "../services/notification.service";
import { useAuth } from "./auth.provider";

type NotificationContextType = {
  unreadCount: number;
  isInitialized: boolean;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  getFCMToken: () => Promise<string | null>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const {
    unreadCount = 0,
    isInitialized = false,
    markAllAsRead = async () => {},
    refresh = async () => {},
    getFCMToken = async () => null,
  } = useNotifications(user?.id || "") || {};

  useEffect(() => {
    if (user?.id && !isInitialized) {
      NotificationService.initialize(user.id);
    }
  }, [user?.id, isInitialized]);

  const contextValue: NotificationContextType = {
    unreadCount,
    isInitialized,
    markAllAsRead,
    refresh,
    getFCMToken,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
