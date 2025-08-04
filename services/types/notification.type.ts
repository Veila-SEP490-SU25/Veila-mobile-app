export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "chat" | "order" | "promotion" | "system";
  data?: {
    chatRoomId?: string;
    orderId?: string;
    shopId?: string;
    [key: string]: any;
  };
  isRead: boolean;
  timestamp: Date;
  imageUrl?: string;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: {
    type: string;
    [key: string]: any;
  };
}

export interface NotificationSettings {
  userId: string;
  chatNotifications: boolean;
  orderNotifications: boolean;
  promotionNotifications: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
