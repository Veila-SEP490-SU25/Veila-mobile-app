import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "small" | "medium" | "large";
  rounded?: boolean;
  outlined?: boolean;
  dot?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

export default function Badge({
  children,
  variant = "default",
  size = "medium",
  rounded = false,
  outlined = false,
  dot = false,
  icon,
  onPress,
  disabled = false,
  style,
}: BadgeProps) {
  const getVariantStyles = () => {
    if (outlined) {
      switch (variant) {
        case "primary":
          return {
            backgroundColor: "transparent",
            borderColor: "#E05C78",
          };
        case "secondary":
          return {
            backgroundColor: "transparent",
            borderColor: "#6B7280",
          };
        case "success":
          return {
            backgroundColor: "transparent",
            borderColor: "#10B981",
          };
        case "warning":
          return {
            backgroundColor: "transparent",
            borderColor: "#F59E0B",
          };
        case "danger":
          return {
            backgroundColor: "transparent",
            borderColor: "#EF4444",
          };
        case "info":
          return {
            backgroundColor: "transparent",
            borderColor: "#3B82F6",
          };
        default:
          return {
            backgroundColor: "transparent",
            borderColor: "#D1D5DB",
          };
      }
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: "#E05C78",
          borderColor: "#E05C78",
        };
      case "secondary":
        return {
          backgroundColor: "#6B7280",
          borderColor: "#6B7280",
        };
      case "success":
        return {
          backgroundColor: "#10B981",
          borderColor: "#10B981",
        };
      case "warning":
        return {
          backgroundColor: "#F59E0B",
          borderColor: "#F59E0B",
        };
      case "danger":
        return {
          backgroundColor: "#EF4444",
          borderColor: "#EF4444",
        };
      case "info":
        return {
          backgroundColor: "#3B82F6",
          borderColor: "#3B82F6",
        };
      default:
        return {
          backgroundColor: "#F3F4F6",
          borderColor: "#D1D5DB",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          fontSize: 12,
          borderRadius: rounded ? 12 : 6,
        };
      case "large":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 16,
          borderRadius: rounded ? 20 : 10,
        };
      default:
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 14,
          borderRadius: rounded ? 16 : 8,
        };
    }
  };

  const getTextColor = () => {
    if (outlined) {
      switch (variant) {
        case "primary":
          return "#E05C78";
        case "secondary":
          return "#6B7280";
        case "success":
          return "#10B981";
        case "warning":
          return "#F59E0B";
        case "danger":
          return "#EF4444";
        case "info":
          return "#3B82F6";
        default:
          return "#6B7280";
      }
    }

    return "#FFFFFF";
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 12;
      case "large":
        return 16;
      default:
        return 14;
    }
  };

  const renderDot = () => {
    if (!dot) return null;

    const dotSize = size === "small" ? 6 : size === "large" ? 10 : 8;
    const dotColor = getTextColor();

    return (
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: dotColor,
            borderRadius: dotSize / 2,
          },
        ]}
      />
    );
  };

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={getTextColor()}
        style={styles.icon}
      />
    );
  };

  const badgeContent = (
    <View style={[styles.badge, getVariantStyles(), getSizeStyles(), style]}>
      {renderDot()}
      {renderIcon()}
      <Text style={[styles.text, { color: getTextColor() }]}>{children}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }

  return badgeContent;
}

// Specialized badge components for common use cases
export const StatusBadge = ({
  status,
  ...props
}: Omit<BadgeProps, "children" | "variant"> & {
  status: "active" | "inactive" | "pending" | "completed" | "cancelled";
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return { variant: "success" as const, children: "Hoạt động" };
      case "inactive":
        return { variant: "secondary" as const, children: "Không hoạt động" };
      case "pending":
        return { variant: "warning" as const, children: "Đang chờ" };
      case "completed":
        return { variant: "success" as const, children: "Hoàn thành" };
      case "cancelled":
        return { variant: "danger" as const, children: "Đã hủy" };
      default:
        return { variant: "default" as const, children: status };
    }
  };

  const config = getStatusConfig();
  return (
    <Badge variant={config.variant} {...props}>
      {config.children}
    </Badge>
  );
};

export const NotificationBadge = ({
  count,
  maxCount = 99,
  ...props
}: Omit<BadgeProps, "children"> & {
  count: number;
  maxCount?: number;
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  if (count === 0) return null;

  return (
    <Badge variant="danger" size="small" rounded {...props}>
      {displayCount}
    </Badge>
  );
};

export const CategoryBadge = ({
  category,
  ...props
}: Omit<BadgeProps, "children" | "variant"> & {
  category: string;
}) => {
  const getCategoryVariant = (cat: string) => {
    const categoryMap: Record<string, BadgeProps["variant"]> = {
      DRESS: "primary",
      ACCESSORY: "secondary",
      SERVICE: "success",
      BLOG: "info",
      NEW: "warning",
      SALE: "danger",
    };

    return categoryMap[cat.toUpperCase()] || "default";
  };

  return (
    <Badge variant={getCategoryVariant(category)} size="small" {...props}>
      {category}
    </Badge>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 20,
  },
  text: {
    fontWeight: "500",
    textAlign: "center",
  },
  icon: {
    marginRight: 4,
  },
  dot: {
    marginRight: 6,
  },
});
