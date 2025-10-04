import React, { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
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
  const { conversations, createConversation } = useSocket();
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

      // Chat rooms sẽ được load từ socket conversations
      setLoading(false);
    } catch {
      setError("Không thể tải danh sách chat");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Đồng bộ danh sách hội thoại từ socket
    if (conversations) {
      setChatRooms(conversations as any);
      setLoading(false);
      setError(null);
    }
  }, [conversations]);

  const createChatRoom = async (
    chatRoomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">
  ): Promise<string> => {
    try {
      const receiverId = chatRoomData.shopId || chatRoomData.customerId;
      if (!receiverId) {
        setError("Thiếu receiverId");
        throw new Error("Thiếu receiverId");
      }
      const roomId = await createConversation(receiverId);
      return roomId;
    } catch (error) {
      setError("Không thể tạo cuộc trò chuyện mới");
      throw error;
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
