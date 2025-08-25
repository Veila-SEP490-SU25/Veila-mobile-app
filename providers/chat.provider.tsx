import React, { createContext, useContext, useEffect, useState } from "react";
import { ChatService } from "../services/chat.service";
import { ChatRoom } from "../services/types";
import { getValidUserId } from "../utils/test-user.util";
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

  const refreshChatRooms = () => {
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    const userId = getValidUserId(user?.id);
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = ChatService.subscribeToChatRooms(
      userId,
      "customer", // Default to customer for now
      (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

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
