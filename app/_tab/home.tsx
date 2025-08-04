import { Ionicons } from "@expo/vector-icons";
import BannerCarousel from "components/homePage/BannerCarousel";
import CategoryGrid from "components/homePage/CategoryGrid";
import HomeHeader from "components/homePage/HomeHeader";
import RecommendedList from "components/homePage/RecommendedList";
import SideMenu from "components/homePage/SideMenu";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useTokenCheck } from "../../hooks/useTokenCheck";

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useTokenCheck();

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: "consultation",
      title: "Tư vấn miễn phí",
      subtitle: "Nhận tư vấn từ chuyên gia",
      icon: "chatbubble-ellipses-outline",
      color: "#E05C78",
      onPress: () => console.log("Consultation pressed"),
    },
    {
      id: "custom-design",
      title: "Đặt may váy",
      subtitle: "Thiết kế theo yêu cầu",
      icon: "cut",
      color: "#8B5CF6",
      onPress: () => console.log("Custom design pressed"),
    },
    {
      id: "buy-dress",
      title: "Mua váy cưới",
      subtitle: "Sở hữu váy cưới yêu thích",
      icon: "cart-outline",
      color: "#06B6D4",
      onPress: () => console.log("Buy dress pressed"),
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
      onPress: () => console.log("Custom request pressed"),
    },
  ];

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
        <View
          style={[
            styles.quickActionIcon,
            { backgroundColor: `${action.color}15` },
          ]}
        >
          <Ionicons name={action.icon} size={24} color={action.color} />
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
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        />
      )}

      {showMenu && (
        <SideMenu
          onClose={() => setShowMenu(false)}
          navigate={(route: string) => {
            if (
              route === "/_tab/home" ||
              route === "/_tab/shopping" ||
              route === "/_tab/chat" ||
              route === "/_tab/notifications" ||
              route === "/_tab/account"
            ) {
              router.push(route as any);
            } else {
              console.log("Navigate to:", route);
            }
            setShowMenu(false);
          }}
        />
      )}

      <HomeHeader onMenuPress={() => setShowMenu(true)} />

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
