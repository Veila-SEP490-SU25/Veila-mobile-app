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
import { checkFirestoreConnection, db } from "./firebase";
import { ChatMessage, ChatRoom, SendMessageRequest } from "./types";

const mockChatRooms: ChatRoom[] = [
  {
    id: "1",
    customerId: "customer1",
    customerName: "Khách hàng",
    customerAvatar: undefined,
    shopId: "shop1",
    shopName: "Shop Váy Cưới Đẹp",
    shopAvatar: undefined,
    lastMessage: {
      id: "msg1",
      senderId: "shop1",
      senderName: "Shop Váy Cưới Đẹp",
      senderAvatar: undefined,
      content: "Chào bạn! Bạn cần tư vấn gì về váy cưới?",
      timestamp: new Date(),
      isRead: false,
      type: "text",
    },
    lastMessageTime: new Date(),
    unreadCount: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    customerId: "customer1",
    customerName: "Khách hàng",
    customerAvatar: undefined,
    shopId: "shop2",
    shopName: "Bridal Boutique",
    shopAvatar: undefined,
    lastMessage: {
      id: "msg2",
      senderId: "shop2",
      senderName: "Bridal Boutique",
      senderAvatar: undefined,
      content: "Váy của bạn đã sẵn sàng để thử",
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      type: "text",
    },
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class ChatService {

  private static isDevelopmentMode() {
    return !db;
  }

  static async ensureConnection() {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Firestore connection not required");
      return true;
    }

    try {
      const isConnected = await checkFirestoreConnection();
      if (!isConnected) {
        console.warn("Firestore connection not available, using offline mode");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Error checking Firestore connection:", error);
      return false;
    }
  }

  static async findExistingChatRoom(
    customerId: string,
    shopId: string
  ): Promise<string | null> {
    if (this.isDevelopmentMode()) {

      return mockChatRooms[0]?.id || null;
    }

    try {
      if (!customerId || !shopId || !db) {
        console.warn("Invalid customerId, shopId, or db not available");
        return null;
      }

      const q = query(
        collection(db, "chatRooms"),
        where("customerId", "==", customerId),
        where("shopId", "==", shopId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const chatRoomId = querySnapshot.docs[0].id;
        console.log("Found existing chat room:", chatRoomId);
        return chatRoomId;
      }
      return null;
    } catch (error) {
      console.error("Error finding existing chat room:", error);
      return null;
    }
  }

  static async createChatRoom(
    chatRoom: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    if (this.isDevelopmentMode()) {

      console.log("Development mode: Mock chat room created");
      return "mock-chat-room-1";
    }

    try {
      if (!db) {
        throw new Error("Firestore not available");
      }

      if (
        !chatRoom.customerId ||
        !chatRoom.shopId ||
        !chatRoom.customerName ||
        !chatRoom.shopName
      ) {
        throw new Error("Missing required chat room information");
      }

      const existingChatRoomId = await this.findExistingChatRoom(
        chatRoom.customerId,
        chatRoom.shopId
      );

      if (existingChatRoomId) {
        console.log("Chat room already exists, returning existing ID");
        return existingChatRoomId;
      }

      const chatRoomData: any = {
        customerId: chatRoom.customerId,
        customerName: chatRoom.customerName,
        shopId: chatRoom.shopId,
        shopName: chatRoom.shopName,
        unreadCount: chatRoom.unreadCount || 0,
        isActive: chatRoom.isActive !== undefined ? chatRoom.isActive : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
      };

      if (chatRoom.customerAvatar) {
        chatRoomData.customerAvatar = chatRoom.customerAvatar;
      }
      if (chatRoom.shopAvatar) {
        chatRoomData.shopAvatar = chatRoom.shopAvatar;
      }

      const chatRoomRef = await addDoc(
        collection(db, "chatRooms"),
        chatRoomData
      );

      console.log("New chat room created with ID:", chatRoomRef.id);
      return chatRoomRef.id;
    } catch (error) {
      console.error("Error creating chat room:", error);
      throw new Error("Không thể tạo phòng chat. Vui lòng thử lại.");
    }
  }

  static async getChatRooms(
    userId: string,
    userType: "customer" | "shop"
  ): Promise<ChatRoom[]> {
    if (this.isDevelopmentMode()) {

      console.log("Development mode: Returning mock chat rooms");
      return mockChatRooms;
    }

    try {
      if (!userId || !userType || !db) {
        console.warn("Invalid userId, userType, or db not available");
        return [];
      }

      const field = userType === "customer" ? "customerId" : "shopId";
      const q = query(
        collection(db, "chatRooms"),
        where(field, "==", userId),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessageTime: doc.data().lastMessageTime?.toDate(),
      })) as ChatRoom[];
    } catch (error: any) {
      console.warn("Firestore index not ready, using fallback query");

      try {
        if (!db) {
          console.warn("Firestore not available for fallback");
          return [];
        }

        const field = userType === "customer" ? "customerId" : "shopId";
        const q = query(
          collection(db, "chatRooms"),
          where(field, "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const chatRooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          lastMessageTime: doc.data().lastMessageTime?.toDate(),
        })) as ChatRoom[];

        return chatRooms.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || new Date(0);
          const dateB = b.updatedAt || b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (fallbackError) {
        console.warn("Fallback query failed:", fallbackError);
        return [];
      }
    }
  }

  static subscribeToChatRooms(
    userId: string,
    userType: "customer" | "shop",
    callback: (chatRooms: ChatRoom[]) => void
  ) {
    if (this.isDevelopmentMode()) {

      console.log("Development mode: Mock chat rooms subscription");
      callback(mockChatRooms);

      return () => {
        console.log("Development mode: Mock subscription unsubscribed");
      };
    }

    try {
      if (!userId || !userType || !db) {
        console.warn("Invalid userId, userType, or db not available");
        return () => {};
      }

      const field = userType === "customer" ? "customerId" : "shopId";

      const q = query(collection(db, "chatRooms"), where(field, "==", userId));

      return onSnapshot(
        q,
        (querySnapshot) => {
          try {
            const chatRooms = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
              lastMessageTime: doc.data().lastMessageTime?.toDate(),
            })) as ChatRoom[];

            const sortedChatRooms = chatRooms.sort((a, b) => {
              const dateA = a.updatedAt || a.createdAt || new Date(0);
              const dateB = b.updatedAt || b.createdAt || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });

            callback(sortedChatRooms);
          } catch (error) {
            console.warn("Error processing chat rooms data:", error);
            callback([]);
          }
        },
        (error: any) => {
          console.warn("Error in chat rooms subscription:", error);

          if (error.code === "failed-precondition") {
            console.warn(
              "Firestore index not ready, using fallback subscription"
            );

            callback([]);
          } else if (error.code === "unavailable") {
            console.warn("Firestore unavailable, using offline mode");
            callback([]);
          } else {
            console.warn("Unknown error in subscription:", error);
            callback([]);
          }
        }
      );
    } catch (error) {
      console.warn("Error setting up chat rooms subscription:", error);

      return () => {};
    }
  }

  static async sendMessage(
    messageData: SendMessageRequest,
    senderInfo: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
    }
  ): Promise<string> {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Mock message sent");
      return "mock-message-1";
    }

    try {
      if (!db) {
        throw new Error("Firestore not available");
      }

      const message: Omit<ChatMessage, "id"> = {
        chatRoomId: messageData.chatRoomId,
        senderId: senderInfo.senderId,
        senderName: senderInfo.senderName,
        content: messageData.content,
        timestamp: new Date(),
        isRead: false,
        type: messageData.type,
      };

      if (senderInfo.senderAvatar) {
        message.senderAvatar = senderInfo.senderAvatar;
      }
      if (messageData.imageUrl) {
        message.imageUrl = messageData.imageUrl;
      }
      if (messageData.fileUrl) {
        message.fileUrl = messageData.fileUrl;
      }
      if (messageData.fileName) {
        message.fileName = messageData.fileName;
      }

      const messageRef = await addDoc(collection(db, "messages"), message);

      await this.updateChatRoomLastMessage(messageData.chatRoomId, {
        content: messageData.content,
        timestamp: message.timestamp,
        senderName: senderInfo.senderName,
        senderId: senderInfo.senderId,
      });

      return messageRef.id;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  }

  static async getMessages(
    chatRoomId: string,
    limitCount: number = 50
  ): Promise<ChatMessage[]> {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Returning mock messages");
      return [];
    }

    try {
      if (!chatRoomId || !db) {
        console.warn("Invalid chatRoomId or db not available");
        return [];
      }

      const q = query(
        collection(db, "messages"),
        where("chatRoomId", "==", chatRoomId),
        orderBy("timestamp", "asc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      return messages.reverse();
    } catch (error: any) {
      console.warn(
        "Index not ready, using fallback query for messages",
        error as any
      );

      try {
        if (!db) {
          console.warn("Firestore not available for fallback");
          return [];
        }

        const q = query(
          collection(db, "messages"),
          where("chatRoomId", "==", chatRoomId),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as ChatMessage[];

        return messages.sort((a, b) => {
          const dateA = a.timestamp || new Date(0);
          const dateB = b.timestamp || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (fallbackError) {
        console.warn("Fallback query failed:", fallbackError);
        return [];
      }
    }
  }

  static subscribeToMessages(
    chatRoomId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Mock messages subscription");
      callback([]);
      return () => {
        console.log(
          "Development mode: Mock messages subscription unsubscribed"
        );
      };
    }

    try {
      if (!chatRoomId || !db) {
        console.warn("Invalid chatRoomId or db not available");
        return () => {};
      }

      const q = query(
        collection(db, "messages"),
        where("chatRoomId", "==", chatRoomId),
        limit(100)
      );

      return onSnapshot(
        q,
        (querySnapshot) => {
          try {
            const messages = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date(),
            })) as ChatMessage[];

            const sortedMessages = messages.sort((a, b) => {
              const dateA = a.timestamp || new Date(0);
              const dateB = b.timestamp || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });

            callback(sortedMessages);
          } catch (error) {
            console.warn("Error processing messages data:", error);
            callback([]);
          }
        },
        (error) => {
          console.warn("Error in messages subscription:", error);

          if (error.code === "failed-precondition") {
            console.warn(
              "Firestore index not ready, using fallback subscription"
            );
            callback([]);
          } else if (error.code === "unavailable") {
            console.warn("Firestore unavailable, using offline mode");
            callback([]);
          } else {
            console.warn("Unknown error in messages subscription:", error);
            callback([]);
          }
        }
      );
    } catch (error) {
      console.warn("Error setting up messages subscription:", error);

      return () => {};
    }
  }

  static async markMessagesAsRead(
    chatRoomId: string,
    userId: string
  ): Promise<void> {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Mock mark as read");
      return;
    }

    try {
      if (!chatRoomId || !userId || !db) {
        console.warn("Invalid chatRoomId, userId, or db not available");
        return;
      }

      const q = query(
        collection(db, "messages"),
        where("chatRoomId", "==", chatRoomId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return;
      }

      const updatePromises: Promise<void>[] = [];
      let unreadCount = 0;

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (!data.isRead && data.senderId !== userId) {
          updatePromises.push(updateDoc(doc.ref, { isRead: true }));
          unreadCount++;
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`Marked ${unreadCount} messages as read`);

        await this.updateChatRoomUnreadCount(chatRoomId, userId);
      }
    } catch (error) {
      console.warn("Error marking messages as read:", error);

    }
  }

  private static async updateChatRoomUnreadCount(
    chatRoomId: string,
    userId: string
  ): Promise<void> {
    if (this.isDevelopmentMode()) {
      return;
    }

    try {
      if (!chatRoomId || !userId || !db) {
        console.warn("Invalid chatRoomId, userId, or db not available");
        return;
      }

      const chatRoomRef = doc(db, "chatRooms", chatRoomId);
      const chatRoomDoc = await getDoc(chatRoomRef);

      if (chatRoomDoc.exists()) {

        await updateDoc(chatRoomRef, {
          unreadCount: 0,
          updatedAt: serverTimestamp(),
        });

        console.log("Reset unread count for chat room:", chatRoomId);
      }
    } catch (error) {
      console.warn("Error updating chat room unread count:", error);

    }
  }

  private static async updateChatRoomLastMessage(
    chatRoomId: string,
    lastMessage: {
      content: string;
      timestamp: Date;
      senderName: string;
      senderId: string;
    }
  ): Promise<void> {
    if (this.isDevelopmentMode()) {
      return;
    }

    try {
      if (!chatRoomId || !db) {
        console.warn("Invalid chatRoomId or db not available");
        return;
      }

      const chatRoomRef = doc(db, "chatRooms", chatRoomId);

      const chatRoomDoc = await getDoc(chatRoomRef);
      if (chatRoomDoc.exists()) {
        const chatRoomData = chatRoomDoc.data();

        const currentUnreadCount = chatRoomData.unreadCount || 0;

        const updateData: any = {
          lastMessage: {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            senderName: lastMessage.senderName,
          },
          lastMessageTime: lastMessage.timestamp,
          updatedAt: serverTimestamp(),
          unreadCount: currentUnreadCount + 1,
        };

        await updateDoc(chatRoomRef, updateData);
        console.log("Updated chat room last message and unread count");
      }
    } catch (error) {
      console.warn("Error updating chat room last message:", error);

    }
  }

  static async getChatRoom(chatRoomId: string): Promise<ChatRoom | null> {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Returning mock chat room");
      return mockChatRooms[0] || null;
    }

    try {
      if (!chatRoomId || !db) {
        console.warn("Invalid chatRoomId or db not available");
        return null;
      }

      const docRef = doc(db, "chatRooms", chatRoomId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const chatRoomData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
          lastMessageTime: docSnap.data().lastMessageTime?.toDate(),
        } as ChatRoom;

        console.log("Retrieved chat room:", chatRoomData.id);
        return chatRoomData;
      }

      console.log("Chat room not found:", chatRoomId);
      return null;
    } catch (error) {
      console.error("Error getting chat room:", error);
      return null;
    }
  }

  static async updateChatRoom(
    chatRoomId: string,
    updates: Partial<ChatRoom>
  ): Promise<void> {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Mock chat room update");
      return;
    }

    try {
      if (!chatRoomId || !db) {
        console.warn("Invalid chatRoomId or db not available");
        return;
      }

      const cleanUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanUpdates[key] = value;
        }
      });

      cleanUpdates.updatedAt = serverTimestamp();

      const chatRoomRef = doc(db, "chatRooms", chatRoomId);
      await updateDoc(chatRoomRef, cleanUpdates);

      console.log("Chat room updated successfully:", chatRoomId);
    } catch (error) {
      console.error("Error updating chat room:", error);
      throw new Error("Không thể cập nhật phòng chat. Vui lòng thử lại.");
    }
  }

  static async deleteChatRoom(chatRoomId: string): Promise<void> {
    if (this.isDevelopmentMode()) {
      console.log("Development mode: Mock chat room deletion");
      return;
    }

    try {
      if (!chatRoomId || !db) {
        console.warn("Invalid chatRoomId or db not available");
        return;
      }

      console.log("Deleting chat room and all messages:", chatRoomId);

      const q = query(
        collection(db, "messages"),
        where("chatRoomId", "==", chatRoomId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        console.log(`Deleted ${querySnapshot.docs.length} messages`);
      }

      await deleteDoc(doc(db, "chatRooms", chatRoomId));
      console.log("Chat room deleted successfully:", chatRoomId);
    } catch (error) {
      console.error("Error deleting chat room:", error);
      throw new Error("Không thể xóa phòng chat. Vui lòng thử lại.");
    }
  }
}
