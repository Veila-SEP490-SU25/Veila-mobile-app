# Chat và Notification System với Firebase

## Tổng quan

Hệ thống chat và notification realtime được xây dựng sử dụng Firebase Firestore, cung cấp các tính năng:

- **Chat realtime** giữa customer và shop
- **Notification system** với các loại thông báo khác nhau
- **Real-time updates** sử dụng Firebase Firestore listeners
- **Badge notifications** hiển thị số thông báo chưa đọc

## Cấu trúc Files

### Services

- `services/chat.service.ts` - Quản lý chat functionality
- `services/notification.service.ts` - Quản lý notification functionality
- `services/types/chat.type.ts` - Types cho chat
- `services/types/notification.type.ts` - Types cho notification

### Components

- `components/chat/ChatList.tsx` - Danh sách cuộc trò chuyện
- `components/notifications/NotificationList.tsx` - Danh sách thông báo
- `components/notifications/NotificationBadge.tsx` - Badge hiển thị số thông báo

### Hooks

- `hooks/useChat.ts` - Hook quản lý chat state
- `hooks/useNotifications.ts` - Hook quản lý notification state

### Pages

- `app/_tab/chat.tsx` - Tab chat
- `app/_tab/notifications.tsx` - Tab notifications
- `app/chat/[id].tsx` - Chi tiết cuộc trò chuyện

## Cách sử dụng

### 1. Chat System

#### Tạo cuộc trò chuyện mới

```typescript
import { ChatService } from "../services/chat.service";

const createNewChat = async () => {
  const chatRoomData = {
    customerId: "customer123",
    customerName: "Nguyễn Văn A",
    customerAvatar: "https://example.com/avatar.jpg",
    shopId: "shop456",
    shopName: "Shop ABC",
    shopAvatar: "https://example.com/shop-avatar.jpg",
    unreadCount: 0,
    isActive: true,
  };

  const roomId = await ChatService.createChatRoom(chatRoomData);
  console.log("Chat room created:", roomId);
};
```

#### Gửi tin nhắn

```typescript
const sendMessage = async () => {
  const messageData = {
    chatRoomId: "room123",
    content: "Xin chào!",
    type: "text" as const,
  };

  const senderInfo = {
    senderId: "user123",
    senderName: "Nguyễn Văn A",
    senderAvatar: "https://example.com/avatar.jpg",
  };

  const messageId = await ChatService.sendMessage(messageData, senderInfo);
  console.log("Message sent:", messageId);
};
```

#### Sử dụng hook useChat

```typescript
import { useChat } from "../hooks/useChat";

function ChatComponent() {
  const { chatRooms, loading, sendMessage, markMessagesAsRead } = useChat(
    "user123",
    "customer"
  );

  // Sử dụng các functions và state
}
```

### 2. Notification System

#### Tạo thông báo

```typescript
import { NotificationService } from "../services/notification.service";

// Thông báo chat
await NotificationService.createChatNotification(
  "user123",
  "room456",
  "Nguyễn Văn A",
  "Có tin nhắn mới"
);

// Thông báo đơn hàng
await NotificationService.createOrderNotification(
  "user123",
  "order789",
  "Đơn hàng đã được xác nhận",
  "Đơn hàng #12345 đã được shop xác nhận"
);

// Thông báo khuyến mãi
await NotificationService.createPromotionNotification(
  "user123",
  "Khuyến mãi mùa hè",
  "Giảm 20% cho tất cả sản phẩm",
  { promotionId: "promo123" }
);
```

#### Sử dụng hook useNotifications

```typescript
import { useNotifications } from "../hooks/useNotifications";

function NotificationComponent() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, settings } =
    useNotifications("user123");

  // Sử dụng các functions và state
}
```

### 3. Real-time Updates

Hệ thống tự động cập nhật real-time thông qua Firebase Firestore listeners:

- **Chat rooms**: Tự động cập nhật khi có tin nhắn mới
- **Messages**: Tự động load tin nhắn mới trong cuộc trò chuyện
- **Notifications**: Tự động cập nhật khi có thông báo mới
- **Badge**: Tự động cập nhật số thông báo chưa đọc

### 4. Badge Notifications

Badge sẽ hiển thị số thông báo chưa đọc trên tab notifications:

```typescript
import NotificationBadge from '../components/notifications/NotificationBadge';

<NotificationBadge userId="user123" size="small" />
```

## Cấu hình Firebase

Đảm bảo Firebase đã được cấu hình đúng trong `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  measurementId: extra.FIREBASE_MEASUREMENT_ID,
};
```

## Firestore Collections

### chatRooms

```typescript
{
  id: string,
  customerId: string,
  customerName: string,
  customerAvatar?: string,
  shopId: string,
  shopName: string,
  shopAvatar?: string,
  lastMessage?: {
    content: string,
    timestamp: Date,
    senderName: string,
  },
  lastMessageTime?: Date,
  unreadCount: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### messages

```typescript
{
  id: string,
  chatRoomId: string,
  senderId: string,
  senderName: string,
  senderAvatar?: string,
  content: string,
  timestamp: Date,
  isRead: boolean,
  type: 'text' | 'image' | 'file',
  imageUrl?: string,
  fileUrl?: string,
  fileName?: string,
}
```

### notifications

```typescript
{
  id: string,
  userId: string,
  title: string,
  body: string,
  type: 'chat' | 'order' | 'promotion' | 'system',
  data?: {
    chatRoomId?: string,
    orderId?: string,
    shopId?: string,
    [key: string]: any,
  },
  isRead: boolean,
  timestamp: Date,
  imageUrl?: string,
}
```

### notificationSettings

```typescript
{
  userId: string,
  chatNotifications: boolean,
  orderNotifications: boolean,
  promotionNotifications: boolean,
  systemNotifications: boolean,
  soundEnabled: boolean,
  vibrationEnabled: boolean,
}
```

## Tính năng nâng cao

### 1. Push Notifications (FCM)

Để implement push notifications, cần:

- Cài đặt Firebase Cloud Messaging
- Tích hợp với Expo Notifications
- Cấu hình server để gửi push notifications

### 2. File Upload

Để hỗ trợ gửi file và hình ảnh:

- Sử dụng Firebase Storage
- Tích hợp với expo-image-picker
- Cập nhật message type để hỗ trợ file

### 3. Typing Indicators

Để hiển thị "đang nhập":

- Tạo collection typingIndicators
- Subscribe to real-time updates
- Hiển thị indicator trong UI

## Lưu ý

1. **Authentication**: Cần implement proper authentication để lấy user ID thực
2. **Security Rules**: Cấu hình Firestore security rules phù hợp
3. **Performance**: Sử dụng pagination cho messages và notifications
4. **Offline Support**: Firebase hỗ trợ offline mode tự động
5. **Error Handling**: Implement proper error handling cho tất cả operations

## Troubleshooting

### Lỗi thường gặp:

1. **Firebase not initialized**: Kiểm tra cấu hình Firebase
2. **Permission denied**: Kiểm tra Firestore security rules
3. **Real-time not working**: Kiểm tra internet connection
4. **Badge not updating**: Kiểm tra NotificationBadge component
5. **Firestore index error**: Lỗi "The query requires an index"

### Khắc phục lỗi Firestore Index:

#### Cách 1: Deploy indexes tự động

```bash
# Cài đặt Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Login vào Firebase
firebase login

# Deploy indexes
npm run deploy-indexes
```

#### Cách 2: Deploy thủ công

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules
```

#### Cách 3: Tạo index thủ công trên Firebase Console

1. Vào Firebase Console > Firestore Database > Indexes
2. Tạo các composite indexes sau:

**chatRooms collection:**

- `customerId` (Ascending) + `updatedAt` (Descending)
- `shopId` (Ascending) + `updatedAt` (Descending)

**messages collection:**

- `chatRoomId` (Ascending) + `timestamp` (Descending)

**notifications collection:**

- `userId` (Ascending) + `timestamp` (Descending)
- `userId` (Ascending) + `isRead` (Ascending)

### Fallback Mechanism:

Hệ thống đã được cấu hình với fallback mechanism. Khi index chưa sẵn sàng:

- Sử dụng query đơn giản không có `orderBy`
- Sắp xếp dữ liệu thủ công trong JavaScript
- Hiển thị warning trong console

### Debug:

```typescript
// Enable Firebase debug mode
import { enableLogging } from "firebase/firestore";
enableLogging(true);
```

### Debug:

```typescript
// Enable Firebase debug mode
import { enableLogging } from "firebase/firestore";
enableLogging(true);
```
