import { Ionicons } from "@expo/vector-icons";
import BannerCarousel from "components/homePage/BannerCarousel";
import CategoryGrid from "components/homePage/CategoryGrid";
import HomeHeader from "components/homePage/HomeHeader";
import RecommendedList from "components/homePage/RecommendedList";
import SideMenu from "components/homePage/SideMenu";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../providers/auth.provider";
import { useChatContext } from "../../providers/chat.provider";
import { walletApi } from "../../services/apis/wallet.api";

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  badge?: number;
}

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const { user } = useAuth();
  const { chatRooms } = useChatContext();
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  const totalUnreadMessages = chatRooms.reduce((total, room) => {
    return total + (room.unreadCount || 0);
  }, 0);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const loadWallet = async () => {
      if (!user || user.role !== "CUSTOMER") return;
      try {
        setIsLoadingWallet(true);
        const res = await walletApi.getMyWallet();
        if (res?.item?.availableBalance != null) {
          setWalletBalance(formatCurrency(String(res.item.availableBalance)));
        }
      } catch {
      } finally {
        setIsLoadingWallet(false);
      }
    };
    loadWallet();
  }, [user]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleMenuPress = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setShowMenu(false);
  }, []);

  const handleNavigate = useCallback((route: string) => {
    setShowMenu(false);

    setTimeout(() => {
      if (
        route === "/_tab/home" ||
        route === "/_tab/shopping" ||
        route === "/_tab/chat" ||
        route === "/_tab/notifications" ||
        route === "/_tab/account"
      ) {
        router.push(route as any);
      } else if (route.startsWith("/account/")) {
        router.push(route as any);
      } else if (route.startsWith("/contracts/")) {
        router.push(route as any);
      } else if (route === "/shop") {
        router.push(route as any);
      } else {
        console.log("Navigate to:", route);
      }
    }, 200);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: "consultation",
      title: "Tư vấn miễn phí",
      subtitle:
        totalUnreadMessages > 0
          ? `${totalUnreadMessages} tin nhắn chưa đọc`
          : "Nhận tư vấn từ shop",
      icon: "chatbubble-ellipses-outline",
      color: "#E05C78",
      onPress: () => router.push("/shop" as any),
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
    },
    {
      id: "custom-design",
      title: "Đặt may váy",
      subtitle: "Thiết kế theo yêu cầu",
      icon: "cut",
      color: "#8B5CF6",
      onPress: () => router.push("/shop" as any),
    },
    {
      id: "buy-dress",
      title: "Mua váy cưới",
      subtitle: "Sở hữu váy cưới yêu thích",
      icon: "cart-outline",
      color: "#06B6D4",
      onPress: () => router.push("/_tab/shopping"),
    },
    {
      id: "rent-dress",
      title: "Thuê váy cưới",
      subtitle: "Tiết kiệm chi phí",
      icon: "shirt-outline",
      color: "#10B981",
      onPress: () => console.log("Rent dress pressed"),
    },
    {
      id: "custom-request",
      title: "Gửi yêu cầu đặt may",
      subtitle: "Yêu cầu thiết kế cá nhân",
      icon: "document-text-outline",
      color: "#F59E0B",
      onPress: () => router.push("/account/custom-requests" as any),
    },
  ];

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const getPhoneVerification = () => {
    const status = user?.phoneVerificationStatus;
    if (status === "VERIFIED") {
      return {
        label: "Đã xác thực",
        color: "#10B981",
        icon: "shield-checkmark" as const,
      };
    }
    if (status === "PENDING") {
      return {
        label: "Chờ xác thực",
        color: "#F59E0B",
        icon: "shield-outline" as const,
      };
    }
    return {
      label: "Chưa xác thực",
      color: "#EF4444",
      icon: "shield-outline" as const,
    };
  };

  const phoneInfo = getPhoneVerification();
  const addressInfo = user?.address
    ? { label: "Đã cập nhật", color: "#10B981" }
    : { label: "Thiếu địa chỉ", color: "#EF4444" };

  const renderQuickAction = (action: QuickAction) => (
    <Animated.View
      key={action.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.quickActionCard}
        onPress={action.onPress}
        activeOpacity={0.8}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons name={action.icon} size={24} color={action.color} />
          {action.badge && (
            <View style={styles.quickActionBadge}>
              <Text style={styles.quickActionBadgeText}>{action.badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionTitle}>{action.title}</Text>
          <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#72121E" />

      {showMenu && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={handleMenuClose}
          activeOpacity={1}
        />
      )}

      {showMenu && (
        <SideMenu onClose={handleMenuClose} navigate={handleNavigate} />
      )}

      <HomeHeader onMenuPress={handleMenuPress} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.welcomeSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.welcomeTitle}>Chào mừng bạn đến với Veila</Text>
          <Text style={styles.welcomeSubtitle}>
            Khám phá bộ sưu tập váy cưới đẹp nhất và dịch vụ tư vấn chuyên
            nghiệp
          </Text>
        </Animated.View>

        {user?.role === "CUSTOMER" && (
          <Animated.View
            style={[styles.statusChipsSection, { opacity: fadeAnim }]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <TouchableOpacity
                style={[styles.chip, { borderColor: phoneInfo.color }]}
                onPress={() => router.push("/_auth/phone-verification" as any)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.chipIcon,
                    { backgroundColor: `${phoneInfo.color}15` },
                  ]}
                >
                  <Ionicons
                    name={phoneInfo.icon}
                    size={16}
                    color={phoneInfo.color}
                  />
                </View>
                <View style={styles.chipTextWrapper}>
                  <Text style={styles.chipTitle}>Số điện thoại</Text>
                  <Text
                    style={[styles.chipSubtitle, { color: phoneInfo.color }]}
                  >
                    {phoneInfo.label}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, { borderColor: "#06B6D4" }]}
                onPress={() => router.push("/account/wallet" as any)}
                activeOpacity={0.85}
              >
                <View
                  style={[styles.chipIcon, { backgroundColor: `#06B6D415` }]}
                >
                  <Ionicons name="wallet-outline" size={16} color="#06B6D4" />
                </View>
                <View style={styles.chipTextWrapper}>
                  <Text style={styles.chipTitle}>Số dư ví</Text>
                  <Text style={[styles.chipSubtitle, { color: "#06B6D4" }]}>
                    {isLoadingWallet ? "Đang tải..." : (walletBalance ?? "—")}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, { borderColor: addressInfo.color }]}
                onPress={() => router.push("/account/address" as any)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.chipIcon,
                    { backgroundColor: `${addressInfo.color}15` },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={addressInfo.color}
                  />
                </View>
                <View style={styles.chipTextWrapper}>
                  <Text style={styles.chipTitle}>Địa chỉ giao hàng</Text>
                  <Text
                    style={[styles.chipSubtitle, { color: addressInfo.color }]}
                  >
                    {addressInfo.label}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.chip, { borderColor: "#F59E0B" }]}
                onPress={() => router.push("/account/orders" as any)}
                activeOpacity={0.85}
              >
                <View
                  style={[styles.chipIcon, { backgroundColor: `#F59E0B15` }]}
                >
                  <Ionicons
                    name="file-tray-outline"
                    size={16}
                    color="#F59E0B"
                  />
                </View>
                <View style={styles.chipTextWrapper}>
                  <Text style={styles.chipTitle}>Đơn hàng</Text>
                  <Text style={[styles.chipSubtitle, { color: "#F59E0B" }]}>
                    Xem gần đây
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View style={{ opacity: fadeAnim }}>
          <BannerCarousel />
        </Animated.View>

        <Animated.View
          style={[styles.quickActionsSection, { opacity: fadeAnim }]}
        >
          <Text style={styles.sectionTitle}>Dịch vụ nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <CategoryGrid />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <RecommendedList />
        </Animated.View>

        <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => console.log("Find design pressed")}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>
              Tìm thiết kế dành riêng cho bạn
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  statusChipsSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  chipTextWrapper: {
    minWidth: 110,
  },
  chipTitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  chipSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  quickActionsSection: {
    backgroundColor: "#FFFFFF",

    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickActionsGrid: {
    paddingHorizontal: 20,
  },
  quickActionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: "#666666",
  },
  quickActionBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#E05C78",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  specialOffersSection: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    paddingVertical: 16,
  },
  offersContainer: {
    paddingHorizontal: 20,
  },
  offerCard: {
    width: 280,
    backgroundColor: "#FFF8F8",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#FFE4E9",
    position: "relative",
  },
  offerBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: "#E05C78",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  offerContent: {
    marginTop: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 8,
  },
  offerExpiry: {
    fontSize: 11,
    color: "#E05C78",
    fontWeight: "500",
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E05C78",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
