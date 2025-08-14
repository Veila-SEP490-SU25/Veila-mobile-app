import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  variant?:
    | "default"
    | "search"
    | "list"
    | "favorites"
    | "orders"
    | "notifications";
  showAction?: boolean;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
  variant = "default",
  showAction = true,
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case "search":
        return "search-outline";
      case "list":
        return "list-outline";
      case "favorites":
        return "heart-outline";
      case "orders":
        return "cube-outline";
      case "notifications":
        return "notifications-outline";
      default:
        return "document-outline";
    }
  };

  const getDefaultActionText = () => {
    switch (variant) {
      case "search":
        return "Thử từ khóa khác";
      case "list":
        return "Làm mới";
      case "favorites":
        return "Khám phá sản phẩm";
      case "orders":
        return "Mua sắm ngay";
      case "notifications":
        return "Kiểm tra cài đặt";
      default:
        return "Thử lại";
    }
  };

  const getDefaultSubtitle = () => {
    switch (variant) {
      case "search":
        return "Không tìm thấy kết quả phù hợp với từ khóa của bạn";
      case "list":
        return "Danh sách trống hoặc đang được cập nhật";
      case "favorites":
        return "Bạn chưa có sản phẩm yêu thích nào";
      case "orders":
        return "Bạn chưa có đơn hàng nào";
      case "notifications":
        return "Bạn chưa có thông báo nào";
      default:
        return "Không có dữ liệu để hiển thị";
    }
  };

  const currentIcon = icon || getDefaultIcon();
  const currentActionText = actionText || getDefaultActionText();
  const currentSubtitle = subtitle || getDefaultSubtitle();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={currentIcon} size={64} color="#D1D5DB" />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>{currentSubtitle}</Text>

      {showAction && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{currentActionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Specialized EmptyState components for common use cases
export const EmptySearchState = ({
  query,
  onClearSearch,
}: {
  query: string;
  onClearSearch: () => void;
}) => (
  <EmptyState
    variant="search"
    title="Không tìm thấy kết quả"
    subtitle={`Không có kết quả nào cho "${query}"`}
    actionText="Xóa tìm kiếm"
    onAction={onClearSearch}
  />
);

export const EmptyListState = ({
  title,
  subtitle,
  onRefresh,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}) => (
  <EmptyState
    variant="list"
    title={title}
    subtitle={subtitle}
    actionText="Làm mới"
    onAction={onRefresh}
    showAction={!!onRefresh}
  />
);

export const EmptyFavoritesState = ({
  onExplore,
}: {
  onExplore: () => void;
}) => (
  <EmptyState
    variant="favorites"
    title="Chưa có sản phẩm yêu thích"
    subtitle="Bạn chưa thêm sản phẩm nào vào danh sách yêu thích"
    actionText="Khám phá ngay"
    onAction={onExplore}
  />
);

export const EmptyOrdersState = ({ onShop }: { onShop: () => void }) => (
  <EmptyState
    variant="orders"
    title="Chưa có đơn hàng"
    subtitle="Bạn chưa thực hiện đơn hàng nào"
    actionText="Mua sắm ngay"
    onAction={onShop}
  />
);

export const EmptyNotificationsState = ({
  onSettings,
}: {
  onSettings: () => void;
}) => (
  <EmptyState
    variant="notifications"
    title="Không có thông báo"
    subtitle="Bạn chưa có thông báo nào"
    actionText="Kiểm tra cài đặt"
    onAction={onSettings}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 280,
  },
  actionButton: {
    backgroundColor: "#E05C78",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
