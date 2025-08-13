import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import NotificationService from "../../services/notification.service";

interface NotificationBadgeProps {
  userId: string;
  size?: "small" | "medium" | "large";
}

export default function NotificationBadge({
  userId,
  size = "medium",
}: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await NotificationService.getUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    loadUnreadCount();

    // Subscribe to real-time updates
    const unsubscribe = NotificationService.subscribeToNotifications(
      userId,
      (notifications) => {
        const count = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  if (unreadCount === 0) {
    return null;
  }

  const badgeSize = {
    small: { width: 16, height: 16, fontSize: 10 },
    medium: { width: 20, height: 20, fontSize: 12 },
    large: { width: 24, height: 24, fontSize: 14 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        { width: badgeSize.width, height: badgeSize.height },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: badgeSize.fontSize }]}>
        {unreadCount > 99 ? "99+" : unreadCount.toString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 16,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
});
