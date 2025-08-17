import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ChatService } from "../../services/chat.service";

export default function ChatTestComponent() {
  const [loading, setLoading] = useState(false);

  const testCreateChatRoom = async () => {
    setLoading(true);
    try {
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
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Chat room created: ${roomId}`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: `Error creating chat room: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testSendMessage = async () => {
    setLoading(true);
    try {
      // First create a chat room if needed
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

      // Send a message
      const messageId = await ChatService.sendMessage(
        {
          chatRoomId: roomId,
          content: "Xin chào! Đây là tin nhắn test.",
          type: "text",
        },
        {
          senderId: "customer123",
          senderName: "Nguyễn Văn A",
          senderAvatar: "https://example.com/avatar.jpg",
        }
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Message sent: ${messageId}`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: `Error sending message: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateNotification = async () => {
    setLoading(true);
    try {
      // TODO: Implement notification creation
      const notificationId = "test-notification-123";

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Notification created: ${notificationId}`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: `Error creating notification: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetChatRooms = async () => {
    setLoading(true);
    try {
      const chatRooms = await ChatService.getChatRooms(
        "customer123",
        "customer"
      );
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Found ${chatRooms.length} chat rooms`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: `Error getting chat rooms: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement notification retrieval
      const notifications = ["test-notification-1", "test-notification-2"];

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Found ${notifications.length} notifications`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: `Error getting notifications: ${error}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Chat & Notification Test</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testCreateChatRoom}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Tạo Chat Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testSendMessage}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Gửi Tin Nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testCreateNotification}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Tạo Thông Báo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testGetChatRooms}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Lấy Chat Rooms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testGetNotifications}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Lấy Notifications</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang xử lý...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#333333",
    textAlign: "center" as const,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center" as const,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center" as const,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
  },
};
