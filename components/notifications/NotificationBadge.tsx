import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNotificationContext } from "../../providers/notification.provider";

interface NotificationBadgeProps {
  size?: "small" | "medium" | "large";
}

export default function NotificationBadge({
  size = "medium",
}: NotificationBadgeProps) {
  try {
    const { unreadCount } = useNotificationContext();

    if (!unreadCount || unreadCount === 0) {
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
  } catch (error) {
    return null;
  }
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
