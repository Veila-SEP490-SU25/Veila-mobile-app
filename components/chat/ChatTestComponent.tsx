import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChatService } from "../../services/chat.service";
import { NotificationService } from "../../services/notification.service";

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
      Alert.alert("Thành công", `Chat room created: ${roomId}`);
    } catch (error) {
      Alert.alert("Lỗi", `Error creating chat room: ${error}`);
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

      Alert.alert("Thành công", `Message sent: ${messageId}`);
    } catch (error) {
      Alert.alert("Lỗi", `Error sending message: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateNotification = async () => {
    setLoading(true);
    try {
      const notificationId = await NotificationService.createChatNotification(
        "user123",
        "room456",
        "Nguyễn Văn A",
        "Có tin nhắn mới từ khách hàng"
      );

      Alert.alert("Thành công", `Notification created: ${notificationId}`);
    } catch (error) {
      Alert.alert("Lỗi", `Error creating notification: ${error}`);
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
      Alert.alert("Thành công", `Found ${chatRooms.length} chat rooms`);
    } catch (error) {
      Alert.alert("Lỗi", `Error getting chat rooms: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetNotifications = async () => {
    setLoading(true);
    try {
      const notifications =
        await NotificationService.getNotifications("user123");
      Alert.alert("Thành công", `Found ${notifications.length} notifications`);
    } catch (error) {
      Alert.alert("Lỗi", `Error getting notifications: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
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
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
  },
});
