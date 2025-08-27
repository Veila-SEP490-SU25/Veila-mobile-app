import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { showMessage } from "../utils/message.util";
import { FCMService } from "./fcm.service";
import { db } from "./firebase";
import { Notification } from "./types";

export class NotificationService {
  private static instance: NotificationService;
  private unsubscribeFn: (() => void) | null = null;
  private fcmUnsubscribers: (() => void)[] = [];
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      await FCMService.getInstance().initialize();

      this.setupNotificationHandlers(userId);

      this.isInitialized = true;
    } catch {}
  }

  private setupNotificationHandlers(_userId?: string): void {
    try {
      const unsubscribeReceived =
        FCMService.getInstance().onNotificationReceived((notification) => {
          if (
            notification.request.content.title &&
            notification.request.content.body
          ) {
            showMessage("INF002", notification.request.content.title);
          }
        });

      const unsubscribeResponse =
        FCMService.getInstance().onNotificationResponse(async (response) => {
          const data = response.notification.request.content.data;

          if (data?.type === "chat" && data?.chatRoomId) {
          } else if (data?.type === "order" && data?.orderId) {
          }
        });

      this.fcmUnsubscribers.push(unsubscribeReceived, unsubscribeResponse);
    } catch {}
  }

  private isDevelopmentMode(): boolean {
    return !db;
  }

  private mockNotifications: Notification[] = [
    {
      id: "1",
      userId: "user123",
      title: "Chào mừng đến với Veila",
      body: "Cảm ơn bạn đã đăng ký tài khoản!",
      type: "system",
      isRead: false,
      timestamp: new Date(),
      data: {},
    },
    {
      id: "2",
      userId: "user123",
      title: "Đơn hàng mới",
      body: "Đơn hàng #12345 đã được xác nhận",
      type: "order",
      isRead: false,
      timestamp: new Date(),
      data: { orderId: "12345" },
    },
  ];

  async getUnreadCount(userId: string): Promise<number> {
    if (this.isDevelopmentMode()) {
      if (__DEV__) {
      }
      return this.mockNotifications.filter((n) => !n.isRead).length;
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("isRead", "==", false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting unread count:", error);
      }
      return 0;
    }
  }

  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    if (this.isDevelopmentMode()) {
      if (__DEV__) {
      }
      callback(this.mockNotifications);

      return () => {};
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        limit(50)
      );

      this.unsubscribeFn = onSnapshot(
        q,
        (snapshot) => {
          try {
            const notifications: Notification[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              notifications.push({
                id: doc.id,
                userId: data.userId,
                title: data.title,
                body: data.body,
                type: data.type,
                isRead: data.isRead,
                timestamp: data.timestamp?.toDate() || new Date(),
                data: data.data || {},
              });
            });

            notifications.sort((a, b) => {
              const dateA = a.timestamp || new Date(0);
              const dateB = b.timestamp || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });

            callback(notifications);
          } catch (error) {
            if (__DEV__) {
              console.error("Error processing notifications:", error);
            }
            callback([]);
          }
        },
        (error) => {
          console.error("Error in notifications subscription:", error);
          callback([]);
        }
      );

      return () => {
        if (this.unsubscribeFn) {
          this.unsubscribeFn();
          this.unsubscribeFn = null;
        }
      };
    } catch (error) {
      if (__DEV__) {
        console.error("Error setting up notifications subscription:", error);
      }
      callback([]);
      return () => {};
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (this.isDevelopmentMode()) {
      return;
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (__DEV__) {
        console.error("Error marking notification as read:", error);
      }
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (this.isDevelopmentMode()) {
      return;
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("isRead", "==", false)
      );
      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          isRead: true,
          updatedAt: serverTimestamp(),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      if (__DEV__) {
        console.error("Error marking all notifications as read:", error);
      }
      throw error;
    }
  }

  async createNotification(
    notification: Omit<Notification, "id" | "timestamp">
  ): Promise<string> {
    if (this.isDevelopmentMode()) {
      return "mock-id";
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        timestamp: serverTimestamp(),
        data: {},
      });
      return docRef.id;
    } catch (error) {
      if (__DEV__) {
        console.error("Error creating notification:", error);
      }
      throw error;
    }
  }

  async createChatNotification(
    userId: string,
    chatRoomId: string,
    senderName: string,
    message: string
  ): Promise<string> {
    const title = `Tin nhắn mới từ ${senderName}`;
    const body =
      message.length > 50 ? `${message.substring(0, 50)}...` : message;

    await FCMService.getInstance().sendChatNotification(
      title,
      body,
      chatRoomId,
      senderName
    );

    return this.createNotification({
      userId,
      title,
      body,
      type: "chat",
      isRead: false,
      data: { chatRoomId, senderName },
    });
  }

  async createOrderNotification(
    userId: string,
    orderId: string,
    title: string,
    body: string,
    orderStatus?: string
  ): Promise<string> {
    await FCMService.getInstance().sendOrderNotification(
      title,
      body,
      orderId,
      orderStatus || "updated"
    );

    return this.createNotification({
      userId,
      title,
      body,
      type: "order",
      isRead: false,
      data: { orderId, orderStatus },
    });
  }

  async createPromotionNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    await FCMService.getInstance().sendPromotionNotification(
      title,
      body,
      data?.promotionId
    );

    return this.createNotification({
      userId,
      title,
      body,
      type: "promotion",
      isRead: false,
      data: data || {},
    });
  }

  async getNotificationSettings(userId: string): Promise<any> {
    if (this.isDevelopmentMode()) {
      return null;
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const q = query(
        collection(db, "notificationSettings"),
        where("userId", "==", userId),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting notification settings:", error);
      }
      throw error;
    }
  }

  async createNotificationSettings(settings: any): Promise<string> {
    if (this.isDevelopmentMode()) {
      return "mock-settings-id";
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const docRef = await addDoc(collection(db, "notificationSettings"), {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      if (__DEV__) {
        console.error("Error creating notification settings:", error);
      }
      throw error;
    }
  }

  async updateNotificationSettings(
    userId: string,
    updates: any
  ): Promise<void> {
    if (this.isDevelopmentMode()) {
      return;
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const q = query(
        collection(db, "notificationSettings"),
        where("userId", "==", userId),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, "notificationSettings", snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error updating notification settings:", error);
      }
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.markAsRead(notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.markAllAsRead(userId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    if (this.isDevelopmentMode()) {
      return;
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      if (__DEV__) {
        console.error("Error deleting notification:", error);
      }
      throw error;
    }
  }

  async updateBadgeCount(userId: string): Promise<void> {
    try {
      const unreadCount = await this.getUnreadCount(userId);
      await FCMService.getInstance().setBadgeCount(unreadCount);
    } catch {}
  }

  async clearBadge(): Promise<void> {
    try {
      await FCMService.getInstance().setBadgeCount(0);
    } catch {}
  }

  unsubscribe(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }

    this.fcmUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.fcmUnsubscribers = [];
  }

  async getFCMToken(): Promise<string | null> {
    return await FCMService.getInstance().getToken();
  }

  async refreshFCMToken(): Promise<string | null> {
    return await FCMService.getInstance().refreshToken();
  }
}

export default NotificationService.getInstance();
