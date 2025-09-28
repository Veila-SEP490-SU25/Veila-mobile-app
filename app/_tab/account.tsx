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
import { PhoneVerificationStatus, UserStatus } from "services/types";
import { useAuth } from "../../providers/auth.provider";
import { useChatContext } from "../../providers/chat.provider";
import { useNotificationContext } from "../../providers/notification.provider";
import { dressApi } from "../../services/apis/dress.api";
import { shopApi } from "../../services/apis/shop.api";
import { Dress } from "../../services/types/dress.type";
import { Shop } from "../../services/types/shop.type";

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

  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [favoriteDresses, setFavoriteDresses] = useState<Dress[]>([]);

  const { chatRooms } = useChatContext();
  const { unreadCount } = useNotificationContext();

  const totalUnreadMessages = chatRooms.reduce((total, room) => {
    return total + (room.unreadCount || 0);
  }, 0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [shops, dresses] = await Promise.allSettled([
          shopApi.getFavoriteShops(),
          dressApi.getFavoriteDresses(),
        ]);

        setFavoriteShops(
          shops.status === "fulfilled" && Array.isArray(shops.value)
            ? shops.value
            : []
        );

        setFavoriteDresses(
          dresses.status === "fulfilled" && Array.isArray(dresses.value)
            ? dresses.value
            : []
        );
      } catch {
        setFavoriteShops([]);
        setFavoriteDresses([]);
      }
    };

    fetchFavorites();
  }, []);

  const getPhoneVerificationSubtitle = () => {
    if (!user?.phone) {
      return "Chưa có số điện thoại";
    }

    switch (user.phoneVerificationStatus) {
      case PhoneVerificationStatus.Verified:
        return "Đã xác thực";
      case PhoneVerificationStatus.Pending:
        return "Đang chờ xác thực";
      case PhoneVerificationStatus.Failed:
        return "Xác thực thất bại";
      default:
        return "Chưa xác thực";
    }
  };

  const getPhoneVerificationColor = () => {
    if (!user?.phone) {
      return "#9CA3AF";
    }

    switch (user.phoneVerificationStatus) {
      case PhoneVerificationStatus.Verified:
        return "#10B981";
      case PhoneVerificationStatus.Pending:
        return "#F59E0B";
      case PhoneVerificationStatus.Failed:
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getPhoneVerificationIcon = () => {
    if (!user?.phone) {
      return "call-outline";
    }

    switch (user.phoneVerificationStatus) {
      case PhoneVerificationStatus.Verified:
        return "checkmark-circle";
      case PhoneVerificationStatus.Pending:
        return "time-outline";
      case PhoneVerificationStatus.Failed:
        return "close-circle";
      default:
        return "call-outline";
    }
  };

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
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
      showArrow: true,
      iconColor: "#3B82F6",
    },
    {
      id: "notifications",
      title: "Thông báo",
      subtitle: "Cài đặt thông báo",
      icon: "notifications-outline",
      onPress: () => router.push("/_tab/notifications"),
      badge: unreadCount > 0 ? unreadCount : undefined,
      showArrow: true,
      iconColor: "#F59E0B",
    },
    {
      id: "phone-verification",
      title: "Xác thực số điện thoại",
      subtitle: getPhoneVerificationSubtitle(),
      icon: "call-outline",
      onPress: () => router.push("/_auth/phone-verification"),
      showArrow: true,
      iconColor: getPhoneVerificationColor(),
    },
    {
      id: "wallet",
      title: "Ví điện tử",
      subtitle: "Quản lý tài khoản và thanh toán",
      icon: "wallet-outline",
      onPress: () => router.push("/account/wallet"),
      showArrow: true,
      iconColor: "#10B981",
    },
    {
      id: "order-history",
      title: "Đơn đã mua",
      subtitle: "Xem các đơn hàng của bạn",
      icon: "cube-outline",
      onPress: () => router.push("/account/orders" as any),
      showArrow: true,
      iconColor: "#8B5CF6",
    },
    {
      id: "favorites",
      title: "Sản phẩm yêu thích",
      subtitle: "Danh sách sản phẩm đã lưu",
      icon: "heart-outline",
      onPress: () => router.push("/account/favorites" as any),
      showArrow: true,
      iconColor: "#EF4444",
    },
    {
      id: "address",
      title: "Địa chỉ giao hàng",
      subtitle: "Quản lý địa chỉ giao hàng",
      icon: "location-outline",
      onPress: () => router.push("/account/address"),
      showArrow: true,
      iconColor: "#06B6D4",
    },
    {
      id: "custom-request",
      title: "Gửi yêu cầu đặt may",
      subtitle: "Yêu cầu thiết kế cá nhân",
      icon: "document-text-outline",
      onPress: () => router.push("/account/custom-requests" as any),
      showArrow: true,
      iconColor: "#F59E0B",
    },
    {
      id: "register-shop",
      title: "Đăng ký shop",
      subtitle: "Trở thành đối tác kinh doanh",
      icon: "business-outline",
      onPress: () => router.push("/account/register-shop" as any),
      showArrow: true,
      iconColor: "#8B5CF6",
    },
  ];

  const supportMenuItems: ProfileMenuItem[] = [
    {
      id: "help",
      title: "Hợp đồng khách hàng",
      subtitle: "Xem điều khoản dịch vụ",
      icon: "document-text-outline",
      onPress: () => router.push("/contracts/customer"),
      showArrow: true,
      iconColor: "#6366F1",
    },
    {
      id: "about",
      title: "Về Veila",
      subtitle: "Thông tin về ứng dụng",
      icon: "information-circle-outline",
      onPress: () => router.push("/_auth/about"),
      showArrow: true,
      iconColor: "#8B5CF6",
    },
  ];

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
          </View>

          <View style={styles.profileInfo}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push("/account/profile")}
              activeOpacity={0.8}
            >
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
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{getFullName()}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>

              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <View style={styles.phoneVerificationContainer}>
                    <Ionicons
                      name={getPhoneVerificationIcon()}
                      size={16}
                      color={getPhoneVerificationColor()}
                    />
                    <Text
                      style={[
                        styles.phoneVerificationText,
                        { color: getPhoneVerificationColor() },
                      ]}
                    >
                      {user?.phone ? user.phone : "Chưa có số điện thoại"}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Số điện thoại</Text>
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
          <Text style={styles.sectionTitle}>Yêu thích</Text>
          {favoriteShops.map((shop) => (
            <View key={shop.id} style={styles.favoriteItem}>
              <Text style={styles.favoriteTitle}>{shop.name}</Text>
            </View>
          ))}
          {favoriteDresses.map((dress) => (
            <View key={dress.id} style={styles.favoriteItem}>
              <Text style={styles.favoriteTitle}>{dress.name}</Text>
            </View>
          ))}
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
  phoneVerificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  phoneVerificationText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
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
  favoriteItem: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
});
