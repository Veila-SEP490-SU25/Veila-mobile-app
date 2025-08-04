import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserStatus } from "services/types";
import { useTokenCheck } from "../../hooks/useTokenCheck";
import { useAuth } from "../../providers/auth.provider";

interface ProfileMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  showArrow?: boolean;
  iconColor?: string;
}

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));

  useTokenCheck();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const profileMenuItems: ProfileMenuItem[] = [
    {
      id: "edit-profile",
      title: "Chỉnh sửa hồ sơ",
      subtitle: "Cập nhật thông tin cá nhân",
      icon: "person-outline",
      onPress: () => router.push("/account/profile"),
      showArrow: true,
      iconColor: "#E05C78",
    },
    {
      id: "chat",
      title: "Tin nhắn",
      subtitle: "Xem tin nhắn và thông báo",
      icon: "chatbubble-outline",
      onPress: () => router.push("/_tab/chat"),
      badge: 3,
      showArrow: true,
      iconColor: "#3B82F6",
    },
    {
      id: "notifications",
      title: "Thông báo",
      subtitle: "Cài đặt thông báo",
      icon: "notifications-outline",
      onPress: () => console.log("Notifications pressed"),
      badge: 5,
      showArrow: true,
      iconColor: "#F59E0B",
    },
    {
      id: "wallet",
      title: "Ví điện tử",
      subtitle: "Quản lý tài khoản và thanh toán",
      icon: "wallet-outline",
      onPress: () => console.log("Wallet pressed"),
      showArrow: true,
      iconColor: "#10B981",
    },
    {
      id: "order-history",
      title: "Lịch sử mua hàng",
      subtitle: "Xem đơn hàng đã mua",
      icon: "receipt-outline",
      onPress: () => console.log("Order history pressed"),
      showArrow: true,
      iconColor: "#8B5CF6",
    },
    {
      id: "favorites",
      title: "Sản phẩm yêu thích",
      subtitle: "Danh sách sản phẩm đã lưu",
      icon: "heart-outline",
      onPress: () => console.log("Favorites pressed"),
      showArrow: true,
      iconColor: "#EF4444",
    },
    {
      id: "address",
      title: "Địa chỉ giao hàng",
      subtitle: "Quản lý địa chỉ giao hàng",
      icon: "location-outline",
      onPress: () => console.log("Address pressed"),
      showArrow: true,
      iconColor: "#06B6D4",
    },
    {
      id: "settings",
      title: "Cài đặt",
      subtitle: "Tùy chỉnh ứng dụng",
      icon: "settings-outline",
      onPress: () => console.log("Settings pressed"),
      showArrow: true,
      iconColor: "#6B7280",
    },
  ];

  const supportMenuItems: ProfileMenuItem[] = [
    {
      id: "help",
      title: "Trợ giúp & Phản hồi",
      subtitle: "Liên hệ hỗ trợ khách hàng",
      icon: "help-circle-outline",
      onPress: () => console.log("Help pressed"),
      showArrow: true,
      iconColor: "#6366F1",
    },
    {
      id: "about",
      title: "Về Veila",
      subtitle: "Thông tin về ứng dụng",
      icon: "information-circle-outline",
      onPress: () => console.log("About pressed"),
      showArrow: true,
      iconColor: "#8B5CF6",
    },
  ];

  const getFullName = () => {
    const parts = [user?.firstName, user?.middleName, user?.lastName].filter(
      Boolean
    );
    return parts.join(" ") || "Người dùng";
  };

  const getInitials = () => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderMenuItem = (item: ProfileMenuItem) => (
    <Animated.View key={item.id} style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${item.iconColor}15` },
            ]}
          >
            <Ionicons name={item.icon} size={22} color={item.iconColor} />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.menuItemRight}>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          {item.showArrow && (
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <Animated.View style={[styles.profileSection, { opacity: fadeAnim }]}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Hồ sơ cá nhân</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#E05C78" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
              )}
              {user?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{getFullName()}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>

              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user?.reputation || 0}</Text>
                  <Text style={styles.statLabel}>Điểm uy tín</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statusBadge,
                      user?.status === UserStatus.Active
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        user?.status === UserStatus.Active
                          ? styles.activeText
                          : styles.inactiveText,
                      ]}
                    >
                      {user?.status === UserStatus.Active
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Trạng thái</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.menuSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Tài khoản & Dịch vụ</Text>
          {profileMenuItems.map(renderMenuItem)}
        </Animated.View>

        <Animated.View style={[styles.menuSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          {supportMenuItems.map(renderMenuItem)}
        </Animated.View>

        <Animated.View style={[styles.logoutSection, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#E05C78" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E05C78",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E05C78",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 12,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  activeBadge: {
    backgroundColor: "#E6F9EF",
  },
  inactiveBadge: {
    backgroundColor: "#FDECEC",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeText: {
    color: "#10B981",
  },
  inactiveText: {
    color: "#EF4444",
  },
  statLabel: {
    fontSize: 12,
    color: "#999999",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E6E6E6",
    marginHorizontal: 16,
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    paddingHorizontal: 25,
    paddingVertical: 16,
    backgroundColor: "#F9F9F9",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#999999",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#E05C78",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutSection: {
    paddingHorizontal: 25,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE4E9",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E05C78",
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E05C78",
    marginLeft: 8,
  },
});
