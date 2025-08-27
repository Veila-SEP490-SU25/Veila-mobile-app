import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface FCMToken {
  token: string;
  platform: "ios" | "android" | "web";
  userId?: string;
}

export class FCMService {
  private static instance: FCMService;
  private currentToken: string | null = null;
  private isExpoGo: boolean = false;

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  private detectExpoGo(): boolean {
    return Constants.appOwnership === "expo";
  }

  async initialize(): Promise<void> {
    try {
      this.isExpoGo = this.detectExpoGo();

      if (this.isExpoGo && __DEV__) {
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      await this.requestPermissions();

      await this.getToken();
    } catch {
      if (__DEV__ && !this.isExpoGo) {
        console.warn("FCM initialization limited in current environment");
      }
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        if (__DEV__) {
          console.warn("Permission not granted for push notifications");
        }
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("chat", {
          name: "Chat Messages",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4F46E5",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("orders", {
          name: "Order Updates",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500],
          lightColor: "#10B981",
          sound: "default",
        });
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error("Error requesting notification permissions:", error);
      }
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (this.currentToken) {
        return this.currentToken;
      }

      if (this.isExpoGo) {
        return null;
      }

      const projectId =
        process.env.EXPO_PUBLIC_PROJECT_ID ||
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.expoConfig?.slug;

      if (!projectId) {
        if (__DEV__) {
          console.warn("No projectId found for push notifications");
        }
        return null;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.currentToken = token;
      return token;
    } catch {
      return null;
    }
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    _channelId?: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
        identifier: `local_${Date.now()}`,
      });
    } catch {
    }
  }

  async sendChatNotification(
    title: string,
    body: string,
    chatRoomId: string,
    senderName: string
  ): Promise<void> {
    await this.sendLocalNotification(
      title,
      body,
      {
        type: "chat",
        chatRoomId,
        senderName,
        timestamp: Date.now(),
      },
      "chat"
    );
  }

  async sendOrderNotification(
    title: string,
    body: string,
    orderId: string,
    orderStatus: string
  ): Promise<void> {
    await this.sendLocalNotification(
      title,
      body,
      {
        type: "order",
        orderId,
        orderStatus,
        timestamp: Date.now(),
      },
      "orders"
    );
  }

  async sendPromotionNotification(
    title: string,
    body: string,
    promotionId?: string
  ): Promise<void> {
    await this.sendLocalNotification(
      title,
      body,
      {
        type: "promotion",
        promotionId,
        timestamp: Date.now(),
      },
      "default"
    );
  }

  onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription =
      Notifications.addNotificationReceivedListener(callback);
    return () => subscription.remove();
  }

  onNotificationResponse(
    callback: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const subscription =
      Notifications.addNotificationResponseReceivedListener(callback);
    return () => subscription.remove();
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      if (__DEV__) {
        console.error("Error clearing notifications:", error);
      }
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      if (__DEV__) {
        console.error("Error canceling notification:", error);
      }
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting badge count:", error);
      }
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      if (__DEV__) {
        console.error("Error setting badge count:", error);
      }
    }
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }

  async refreshToken(): Promise<string | null> {
    this.currentToken = null;
    return await this.getToken();
  }
}

export default FCMService.getInstance();
