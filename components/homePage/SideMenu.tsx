import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../providers/auth.provider";

const { width: screenWidth } = Dimensions.get("window");

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
  color?: string;
  subtitle?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "Trang chủ",
    icon: "home-outline",
    route: "/_tab/home",
    color: "#E05C78",
  },
  {
    id: "explore",
    label: "Khám phá sản phẩm",
    subtitle: "Tìm kiếm váy cưới đẹp",
    icon: "pricetags-outline",
    route: "/_tab/shopping",
    color: "#8B5CF6",
  },
  {
    id: "stores",
    label: "Danh sách cửa hàng",
    subtitle: "Showroom gần bạn",
    icon: "storefront-outline",
    route: "/_tab/stores",
    color: "#06B6D4",
  },
  {
    id: "orders",
    label: "Kiểm tra đơn hàng",
    subtitle: "Theo dõi đơn hàng",
    icon: "document-text-outline",
    route: "/orders",
    color: "#10B981",
    badge: 2,
  },
  {
    id: "favorites",
    label: "Danh sách yêu thích",
    subtitle: "Sản phẩm đã lưu",
    icon: "heart-outline",
    route: "/favorites",
    color: "#EF4444",
  },
  {
    id: "account",
    label: "Quản lý tài khoản",
    subtitle: "Thông tin cá nhân",
    icon: "person-outline",
    route: "/account",
    color: "#F59E0B",
  },
];

const supportItems: MenuItem[] = [
  {
    id: "help",
    label: "Trợ giúp & Hỗ trợ",
    subtitle: "Liên hệ chăm sóc khách hàng",
    icon: "help-circle-outline",
    route: "/help",
    color: "#6366F1",
  },
  {
    id: "about",
    label: "Về Veila",
    subtitle: "Thông tin ứng dụng",
    icon: "information-circle-outline",
    route: "/about",
    color: "#8B5CF6",
  },
];

export default function SideMenu({
  onClose,
  navigate,
}: {
  onClose: () => void;
  navigate: (route: string) => void;
}) {
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNavigate = (route: string) => {
    handleClose();
    setTimeout(() => {
      navigate(route);
    }, 250);
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

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleNavigate(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}
        >
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemLabel}>{item.label}</Text>
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
        <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Veila</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.userSection}>
          <View style={styles.userInfo}>
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
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{getFullName()}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userStats}>
                <Text style={styles.userStatText}>
                  Điểm uy tín: {user?.reputation || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu chính</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          {supportItems.map(renderMenuItem)}
        </View>

        <View style={styles.contactSection}>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={16} color="#666666" />
            <Text style={styles.contactText}>Hotline: 0354019580</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#666666" />
            <Text style={styles.contactText}>support@veila.com</Text>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 50,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingTop: 60,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#C04060",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#F9F9F9",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C04060",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 6,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  userStatText: {
    fontSize: 12,
    color: "#999999",
  },
  menuSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#666666",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 13,
    color: "#666666",
    marginLeft: 8,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
  },
});
