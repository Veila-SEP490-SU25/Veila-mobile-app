import { useEffect, useState } from "react";
import { NotificationService } from "../services/notification.service";
import { Notification, NotificationSettings } from "../services/types";

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribeToNotifications(
      userId,
      (notifications) => {
        setNotifications(notifications);
        setUnreadCount(notifications.filter((n) => !n.isRead).length);
        setLoading(false);
        setError(null);
      }
    );

    // Load notification settings
    const loadSettings = async () => {
      try {
        const userSettings =
          await NotificationService.getNotificationSettings(userId);
        if (userSettings) {
          setSettings(userSettings);
        } else {
          // Create default settings
          const defaultSettings: NotificationSettings = {
            userId,
            chatNotifications: true,
            orderNotifications: true,
            promotionNotifications: true,
            systemNotifications: true,
            soundEnabled: true,
            vibrationEnabled: true,
          };
          await NotificationService.createNotificationSettings(defaultSettings);
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error("Error loading notification settings:", err);
      }
    };

    loadSettings();

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
    } catch (err) {
      setError("Không thể đánh dấu thông báo đã đọc");
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllNotificationsAsRead(userId);
    } catch (err) {
      setError("Không thể đánh dấu tất cả thông báo đã đọc");
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
    } catch (err) {
      setError("Không thể xóa thông báo");
      throw err;
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      await NotificationService.updateNotificationSettings(userId, updates);
      setSettings((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      setError("Không thể cập nhật cài đặt thông báo");
      throw err;
    }
  };

  const createChatNotification = async (
    chatRoomId: string,
    senderName: string,
    message: string
  ) => {
    try {
      await NotificationService.createChatNotification(
        userId,
        chatRoomId,
        senderName,
        message
      );
    } catch (err) {
      console.error("Error creating chat notification:", err);
    }
  };

  const createOrderNotification = async (
    orderId: string,
    title: string,
    body: string
  ) => {
    try {
      await NotificationService.createOrderNotification(
        userId,
        orderId,
        title,
        body
      );
    } catch (err) {
      console.error("Error creating order notification:", err);
    }
  };

  const createPromotionNotification = async (
    title: string,
    body: string,
    data?: any
  ) => {
    try {
      await NotificationService.createPromotionNotification(
        userId,
        title,
        body,
        data
      );
    } catch (err) {
      console.error("Error creating promotion notification:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    createChatNotification,
    createOrderNotification,
    createPromotionNotification,
  };
};
