import React, { createContext, useContext, useEffect, useState } from "react";
import { ChatService } from "../services/chat.service";
import { ChatRoom } from "../services/types";

import { useAuth } from "./auth.provider";

interface ChatContextType {
  chatRooms: ChatRoom[];
  loading: boolean;
  error: string | null;
  createChatRoom: (
    chatRoomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">
  ) => Promise<string>;
  refreshChatRooms: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshChatRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Load chat rooms trực tiếp từ Firestore
      const rooms = await ChatService.getChatRooms(user.id, "customer");
      setChatRooms(rooms);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh sách chat");
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = ChatService.subscribeToChatRooms(
      userId,
      "customer",
      (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
        setError(null);
      }
    );

    // Thêm error handling
    const handleError = (error: any) => {
      console.warn("Chat subscription error:", error);
      setError("Không thể tải danh sách chat. Vui lòng thử lại.");
      setLoading(false);
    };

    // Retry mechanism
    const retryTimeout = setTimeout(() => {
      if (chatRooms.length === 0 && !loading) {
        console.log("Retrying chat rooms subscription...");
        refreshChatRooms();
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(retryTimeout);
    };
  }, [user?.id, chatRooms.length, loading]);

  const createChatRoom = async (
    chatRoomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">
  ): Promise<string> => {
    try {
      const roomId = await ChatService.createChatRoom(chatRoomData);
      refreshChatRooms();
      return roomId;
    } catch (err) {
      setError("Không thể tạo cuộc trò chuyện mới");
      throw err;
    }
  };

  const value: ChatContextType = {
    chatRooms,
    loading,
    error,
    createChatRoom,
    refreshChatRooms,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
