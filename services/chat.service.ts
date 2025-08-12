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
import { ChatMessage, ChatRoom, SendMessageRequest } from "./types";

export class ChatService {
  static async createChatRoom(
    chatRoom: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const chatRoomRef = await addDoc(collection(db, "chatRooms"), {
      ...chatRoom,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return chatRoomRef.id;
  }

  static async getChatRooms(
    userId: string,
    userType: "customer" | "shop"
  ): Promise<ChatRoom[]> {
    try {
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
      // Fallback: if index doesn't exist, get without ordering
      if (error.code === "failed-precondition") {
        console.warn("Firestore index not ready, using fallback query");
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

        // Sort manually
        return chatRooms.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || new Date(0);
          const dateB = b.updatedAt || b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      }
      throw error;
    }
  }

  static subscribeToChatRooms(
    userId: string,
    userType: "customer" | "shop",
    callback: (chatRooms: ChatRoom[]) => void
  ) {
    const field = userType === "customer" ? "customerId" : "shopId";

    // Try with ordering first
    const q = query(
      collection(db, "chatRooms"),
      where(field, "==", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const chatRooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          lastMessageTime: doc.data().lastMessageTime?.toDate(),
        })) as ChatRoom[];
        callback(chatRooms);
      },
      (error: any) => {
        // Fallback: if index doesn't exist, use simple query
        if (error.code === "failed-precondition") {
          console.warn(
            "Firestore index not ready, using fallback subscription"
          );
          const fallbackQ = query(
            collection(db, "chatRooms"),
            where(field, "==", userId)
          );

          return onSnapshot(fallbackQ, (querySnapshot) => {
            const chatRooms = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              updatedAt: doc.data().updatedAt?.toDate(),
              lastMessageTime: doc.data().lastMessageTime?.toDate(),
            })) as ChatRoom[];

            // Sort manually
            const sortedChatRooms = chatRooms.sort((a, b) => {
              const dateA = a.updatedAt || a.createdAt || new Date(0);
              const dateB = b.updatedAt || b.createdAt || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });

            callback(sortedChatRooms);
          });
        }
        console.error("Chat rooms subscription error:", error);
      }
    );
  }

  static async sendMessage(
    messageData: SendMessageRequest,
    senderInfo: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
    }
  ): Promise<string> {
    const message: Omit<ChatMessage, "id"> = {
      chatRoomId: messageData.chatRoomId,
      senderId: senderInfo.senderId,
      senderName: senderInfo.senderName,
      senderAvatar: senderInfo.senderAvatar,
      content: messageData.content,
      timestamp: new Date(),
      isRead: false,
      type: messageData.type,
      imageUrl: messageData.imageUrl,
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName,
    };

    const messageRef = await addDoc(collection(db, "messages"), message);

    await this.updateChatRoomLastMessage(messageData.chatRoomId, {
      content: messageData.content,
      timestamp: message.timestamp,
      senderName: senderInfo.senderName,
    });

    return messageRef.id;
  }

  static async getMessages(
    chatRoomId: string,
    limitCount: number = 50
  ): Promise<ChatMessage[]> {
    try {
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
        timestamp: doc.data().timestamp?.toDate(),
      })) as ChatMessage[];

      // Reverse to show newest first (since we're using ascending order)
      return messages.reverse();
    } catch (error: any) {
      // Fallback: if index doesn't exist, get without ordering
      if (error.code === "failed-precondition") {
        console.warn(
          "Firestore index not ready, using fallback query for messages"
        );
        const q = query(
          collection(db, "messages"),
          where("chatRoomId", "==", chatRoomId),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as ChatMessage[];

        // Sort manually
        return messages.sort((a, b) => {
          const dateA = a.timestamp || new Date(0);
          const dateB = b.timestamp || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      }
      throw error;
    }
  }

  static subscribeToMessages(
    chatRoomId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    const q = query(
      collection(db, "messages"),
      where("chatRoomId", "==", chatRoomId),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as ChatMessage[];

      // Reverse to show newest first (since we're using ascending order)
      callback(messages.reverse());
    });
  }

  static async markMessagesAsRead(
    chatRoomId: string,
    userId: string
  ): Promise<void> {
    const q = query(
      collection(db, "messages"),
      where("chatRoomId", "==", chatRoomId),
      where("senderId", "!=", userId),
      where("isRead", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updatePromises);
  }

  private static async updateChatRoomLastMessage(
    chatRoomId: string,
    lastMessage: {
      content: string;
      timestamp: Date;
      senderName: string;
    }
  ): Promise<void> {
    const chatRoomRef = doc(db, "chatRooms", chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: {
        content: lastMessage.content,
        timestamp: lastMessage.timestamp,
        senderName: lastMessage.senderName,
      },
      lastMessageTime: lastMessage.timestamp,
      updatedAt: serverTimestamp(),
    });
  }

  static async getChatRoom(chatRoomId: string): Promise<ChatRoom | null> {
    const docRef = doc(db, "chatRooms", chatRoomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
        lastMessageTime: docSnap.data().lastMessageTime?.toDate(),
      } as ChatRoom;
    }
    return null;
  }

  static async updateChatRoom(
    chatRoomId: string,
    updates: Partial<ChatRoom>
  ): Promise<void> {
    const chatRoomRef = doc(db, "chatRooms", chatRoomId);
    await updateDoc(chatRoomRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteChatRoom(chatRoomId: string): Promise<void> {
    const q = query(
      collection(db, "messages"),
      where("chatRoomId", "==", chatRoomId)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    await deleteDoc(doc(db, "chatRooms", chatRoomId));
  }
}
