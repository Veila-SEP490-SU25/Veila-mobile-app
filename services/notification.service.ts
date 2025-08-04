import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
import { Notification, NotificationSettings } from "./types";

export class NotificationService {
  // Notifications
  static async createNotification(
    notification: Omit<Notification, "id" | "timestamp">
  ): Promise<string> {
    const notificationRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      timestamp: serverTimestamp(),
    });
    return notificationRef.id;
  }

  static async getNotifications(
    userId: string,
    limitCount: number = 50
  ): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Notification[];
    } catch (error: any) {
      // Fallback: if index doesn't exist, get without ordering
      if (error.code === "failed-precondition") {
        console.warn(
          "Firestore index not ready, using fallback query for notifications"
        );
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", userId),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as Notification[];

        // Sort manually
        return notifications.sort((a, b) => {
          const dateA = a.timestamp || new Date(0);
          const dateB = b.timestamp || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      }
      throw error;
    }
  }

  static subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const notifications = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as Notification[];
        callback(notifications);
      },
      (error: any) => {
        // Fallback: if index doesn't exist, use simple query
        if (error.code === "failed-precondition") {
          console.warn(
            "Firestore index not ready, using fallback subscription for notifications"
          );
          const fallbackQ = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            limit(100)
          );

          return onSnapshot(fallbackQ, (querySnapshot) => {
            const notifications = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate(),
            })) as Notification[];

            // Sort manually
            const sortedNotifications = notifications.sort((a, b) => {
              const dateA = a.timestamp || new Date(0);
              const dateB = b.timestamp || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });

            callback(sortedNotifications);
          });
        }
        console.error("Notifications subscription error:", error);
      }
    );
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { isRead: true });
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updatePromises);
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    await deleteDoc(doc(db, "notifications", notificationId));
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }

  // Notification Settings
  static async getNotificationSettings(
    userId: string
  ): Promise<NotificationSettings | null> {
    const docRef = doc(db, "notificationSettings", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as NotificationSettings;
    }
    return null;
  }

  static async createNotificationSettings(
    settings: NotificationSettings
  ): Promise<void> {
    await addDoc(collection(db, "notificationSettings"), settings);
  }

  static async updateNotificationSettings(
    userId: string,
    updates: Partial<NotificationSettings>
  ): Promise<void> {
    const settingsRef = doc(db, "notificationSettings", userId);
    await updateDoc(settingsRef, updates);
  }

  // Push Notifications (for future implementation with FCM)
  static async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
    }
  ): Promise<void> {
    // This would integrate with Firebase Cloud Messaging (FCM)
    // For now, we'll just create a local notification
    await this.createNotification({
      userId,
      title: notification.title,
      body: notification.body,
      type: "system",
      data: notification.data,
      isRead: false,
    });
  }

  // Chat-specific notifications
  static async createChatNotification(
    userId: string,
    chatRoomId: string,
    senderName: string,
    message: string
  ): Promise<string> {
    return await this.createNotification({
      userId,
      title: `Tin nhắn mới từ ${senderName}`,
      body: message,
      type: "chat",
      data: { chatRoomId },
      isRead: false,
    });
  }

  // Order-specific notifications
  static async createOrderNotification(
    userId: string,
    orderId: string,
    title: string,
    body: string
  ): Promise<string> {
    return await this.createNotification({
      userId,
      title,
      body,
      type: "order",
      data: { orderId },
      isRead: false,
    });
  }

  // Promotion notifications
  static async createPromotionNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    return await this.createNotification({
      userId,
      title,
      body,
      type: "promotion",
      data,
      isRead: false,
    });
  }
}
