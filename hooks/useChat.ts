import { useEffect, useState } from "react";
import { ChatService } from "../services/chat.service";
import NotificationService from "../services/notification.service";
import { ChatRoom } from "../services/types";

export const useChat = (userId: string, userType: "customer" | "shop") => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = ChatService.subscribeToChatRooms(
      userId,
      userType,
      (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [userId, userType]);

  const createChatRoom = async (
    chatRoomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const roomId = await ChatService.createChatRoom(chatRoomData);
      return roomId;
    } catch (err) {
      setError("Không thể tạo cuộc trò chuyện mới");
      throw err;
    }
  };

  const sendMessage = async (
    chatRoomId: string,
    content: string,
    senderInfo: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
    }
  ) => {
    try {
      const messageId = await ChatService.sendMessage(
        {
          chatRoomId,
          content,
          type: "text",
        },
        senderInfo
      );

      const chatRoom = chatRooms.find((room) => room.id === chatRoomId);
      if (chatRoom) {
        const otherPartyId =
          userType === "customer" ? chatRoom.shopId : chatRoom.customerId;
        await NotificationService.createChatNotification(
          otherPartyId,
          chatRoomId,
          senderInfo.senderName,
          content
        );
      }

      return messageId;
    } catch (err) {
      setError("Không thể gửi tin nhắn");
      throw err;
    }
  };

  const markMessagesAsRead = async (chatRoomId: string) => {
    try {
      await ChatService.markMessagesAsRead(chatRoomId, userId);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  return {
    chatRooms,
    loading,
    error,
    createChatRoom,
    sendMessage,
    markMessagesAsRead,
  };
};
