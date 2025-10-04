// Web-compatible types
export interface IMessage {
  id: string;
  chatRoomId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string | Date;
  isRead?: boolean;
  type?: "text" | "image" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface IConversation {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  lastMessage?: IMessage;
  unReadCount: number;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Legacy mobile types (for backward compatibility)
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  shopId: string;
  shopName: string;
  shopAvatar?: string;
  lastMessage?: Message;
  lastMessageTime?: Date;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Web compatibility fields
  conversationId?: string;
  receiverId?: string;
  receiverName?: string;
  receiverAvatar?: string;
  unReadCount?: number;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
  type: "text" | "image" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}
