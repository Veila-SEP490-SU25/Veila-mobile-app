import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Notification } from "./types";

export class NotificationService {
  private static instance: NotificationService;
  private unsubscribeFn: (() => void) | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private isDevelopmentMode(): boolean {
    return __DEV__ || !db;
  }

  // Mock data for development
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
      // Return mock data immediately
      callback(this.mockNotifications);

      // Return no-op unsubscribe function
      return () => {};
    }

    if (!db) {
      throw new Error("Firestore not available");
    }

    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
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
            callback(notifications);
          } catch (error) {
            if (__DEV__) {
              console.error("Error processing notifications:", error);
            }
            callback([]);
          }
        },
        (error) => {
          if (__DEV__) {
            console.error("Error in notifications subscription:", error);
          }
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
    notification: Omit<Notification, "id" | "timestamp" | "data">
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

  unsubscribe(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }
  }
}

export default NotificationService.getInstance();
