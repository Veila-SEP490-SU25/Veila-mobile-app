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
