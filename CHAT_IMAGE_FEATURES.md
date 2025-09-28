# Tính Năng Chat Hình Ảnh & Thông Báo - Veila Mobile App

## 🚀 Tính Năng Đã Thêm

### 1. Gửi Hình Ảnh Trong Chat

- **Chọn từ thư viện**: Người dùng có thể chọn hình ảnh từ thư viện ảnh
- **Chụp ảnh trực tiếp**: Sử dụng camera để chụp ảnh mới
- **Chú thích tùy chọn**: Có thể thêm chú thích cho hình ảnh
- **Hiển thị đẹp mắt**: Tin nhắn hình ảnh được hiển thị với giao diện đẹp

### 2. Hiển Thị Thông Báo Từ Firestore

- **Real-time notifications**: Thông báo được cập nhật theo thời gian thực
- **Đánh dấu đã đọc**: Có thể đánh dấu từng thông báo hoặc tất cả đã đọc
- **Phân loại thông báo**: Hỗ trợ các loại: chat, order, promotion, system
- **Navigation thông minh**: Click vào thông báo sẽ điều hướng đến màn hình tương ứng

## 📱 Cách Sử Dụng

### Gửi Hình Ảnh

1. Mở chat với shop
2. Nhấn nút camera (màu hồng) bên trái ô nhập tin nhắn
3. Chọn "Chọn từ thư viện" hoặc "Chụp ảnh"
4. Thêm chú thích (tùy chọn)
5. Nhấn "Gửi"

### Xem Thông Báo

1. Vào tab "Thông báo"
2. Xem danh sách thông báo từ Firestore
3. Nhấn "Đọc tất cả" để đánh dấu tất cả đã đọc
4. Click vào thông báo để điều hướng

## 🔧 Cấu Trúc Code

### Components Mới

- `ImagePicker.tsx`: Component chọn và gửi hình ảnh
- Cập nhật `ChatList.tsx`: Hiển thị tin nhắn hình ảnh
- Cập nhật `NotificationList.tsx`: Hiển thị thông báo từ Firestore

### Services Cập Nhật

- `ChatService`: Thêm method `sendImageMessage`
- `NotificationService`: Lấy thông báo từ Firestore

### Types Cập Nhật

- `ChatMessage`: Hỗ trợ type "image" với `imageUrl`
- `Notification`: Cấu trúc thông báo từ Firestore

## 🗄️ Database Schema

### Firestore Collections

#### notifications

```typescript
{
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "chat" | "order" | "promotion" | "system";
  isRead: boolean;
  timestamp: Timestamp;
  data: Record<string, any>;
}
```

#### messages

```typescript
{
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Timestamp;
  isRead: boolean;
  type: "text" | "image" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}
```

## 🚨 Lưu Ý Quan Trọng

### Permissions

- **Camera**: Cần quyền truy cập camera để chụp ảnh
- **Photo Library**: Cần quyền truy cập thư viện ảnh

### Firebase Configuration

- Đảm bảo Firestore rules cho phép đọc/ghi notifications và messages
- FCM được cấu hình để gửi push notifications

### Performance

- Hình ảnh được nén trước khi hiển thị (quality: 0.8)
- Giới hạn 50 thông báo mỗi lần load

## 🐛 Troubleshooting

### Lỗi Thường Gặp

1. **Không thể chọn ảnh**: Kiểm tra quyền truy cập
2. **Thông báo không hiển thị**: Kiểm tra Firestore rules
3. **Lỗi upload**: Kiểm tra kết nối mạng

### Debug Mode

- Sử dụng `console.log` để debug
- Kiểm tra Firebase Console để xem logs

## 📈 Tính Năng Tương Lai

- [ ] Upload hình ảnh lên Firebase Storage
- [ ] Gửi file (PDF, DOC)
- [ ] Voice messages
- [ ] Video calls
- [ ] Group chat
- [ ] Message reactions
- [ ] Message search
