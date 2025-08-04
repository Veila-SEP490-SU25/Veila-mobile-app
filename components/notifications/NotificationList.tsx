import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NotificationService } from "../../services/notification.service";
import { Notification } from "../../services/types";

interface NotificationListProps {
  userId: string;
}

export default function NotificationList({ userId }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = NotificationService.subscribeToNotifications(
      userId,
      (notifications) => {
        setNotifications(notifications);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await NotificationService.markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
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
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[styles.title, !item.isRead && styles.unreadTitle]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={styles.time}>
              {formatDistanceToNow(item.timestamp, {
                addSuffix: true,
                locale: vi,
              })}
            </Text>
          </View>

          <Text style={styles.body} numberOfLines={3}>
            {item.body}
          </Text>

          {item.data && Object.keys(item.data).length > 0 && (
            <View style={styles.dataContainer}>
              {item.data.chatRoomId && (
                <Text style={styles.dataText}>
                  Chat Room: {item.data.chatRoomId}
                </Text>
              )}
              {item.data.orderId && (
                <Text style={styles.dataText}>Order: {item.data.orderId}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyText}>Không có thông báo nào</Text>
        <Text style={styles.emptySubtext}>
          Bạn sẽ nhận được thông báo khi có tin nhắn mới hoặc cập nhật đơn hàng
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
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  unreadNotification: {
    backgroundColor: "#F8F9FA",
  },
  iconContainer: {
    position: "relative",
    marginRight: 12,
    alignSelf: "flex-start",
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
    color: "#666666",
  },
  body: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
    marginBottom: 8,
  },
  dataContainer: {
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 6,
  },
  dataText: {
    fontSize: 12,
    color: "#666666",
  },
});
