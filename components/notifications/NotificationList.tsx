import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../services/types";

interface NotificationListProps {
  userId: string;
}

export default function NotificationList({ userId }: NotificationListProps) {
  const { notifications, loading, markAsRead } = useNotifications(userId);
  const router = useRouter();

  const handleNotificationPress = async (notification: Notification) => {

    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.type === "chat" && notification.data?.chatRoomId) {
      router.push(`/chat/${notification.data.chatRoomId}` as any);
    } else if (notification.type === "order" && notification.data?.orderId) {
      router.push(`/orders/${notification.data.orderId}` as any);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "chat":
        return "chatbubble-outline";
      case "order":
        return "bag-outline";
      case "promotion":
        return "gift-outline";
      case "system":
        return "information-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "chat":
        return "#007AFF";
      case "order":
        return "#34C759";
      case "promotion":
        return "#FF9500";
      case "system":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: `${iconColor}20` },
            ]}
          >
            <Ionicons name={iconName as any} size={20} color={iconColor} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.timestamp}>
            {formatDistanceToNow(item.timestamp, {
              addSuffix: true,
              locale: vi,
            })}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Không có thông báo</Text>
        <Text style={styles.emptyText}>
          Bạn sẽ nhận được thông báo khi có tin nhắn mới, đơn hàng hoặc cập nhật
          quan trọng.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#8E8E93",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    alignSelf: "center",
  },
});
