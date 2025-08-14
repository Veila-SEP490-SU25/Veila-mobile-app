import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import AccessoryGrid from "../../components/shopping/AccessoryGrid";
import BlogList from "../../components/shopping/BlogList";
import CategoryTabs, {
  CategoryType,
} from "../../components/shopping/CategoryTabs";
import DressGrid from "../../components/shopping/DressGrid";
import { shopApi } from "../../services/apis/shop.api";
import { Accessory, Dress, ShopDetail } from "../../services/types";

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("DRESS");
  const [isFavorite, setIsFavorite] = useState(false);
  const [products, setProducts] = useState<{
    dresses: Dress[];
    rentalDresses: Dress[];
    accessories: Accessory[];
    blogs: any[];
  }>({
    dresses: [],
    rentalDresses: [],
    accessories: [],
    blogs: [],
  });

  const loadShopDetail = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);

      // Load shop details
      const shopData = await shopApi.getShopById(id);

      // Check if the response has the expected structure
      if (shopData && typeof shopData === "object") {
        // If the response has an 'item' property (wrapped response)
        if ("item" in shopData && shopData.item) {
          setShop(shopData.item as ShopDetail);
        } else if ("id" in shopData && "name" in shopData) {
          // If the response is directly the shop data
          const shopDetail: ShopDetail = {
            id: shopData.id as string,
            name: shopData.name as string,
            phone: shopData.phone as string,
            email: shopData.email as string,
            address: shopData.address as string,
            description: shopData.description as string,
            images: shopData.images as string[] | null,
            logoUrl: shopData.logoUrl as string,
            coverUrl: shopData.coverUrl as string,
          };
          setShop(shopDetail);
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Dữ liệu shop không hợp lệ",
          });
          return;
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Dữ liệu shop không hợp lệ",
        });
        return;
      }

      // Load all products
      const [dresses, accessories, blogs] = await Promise.all([
        shopApi.getShopDresses(id, 0, 20),
        shopApi.getShopAccessories(id, 0, 20),
        shopApi.getShopBlogs(id, 0, 20),
      ]);

      setProducts({
        dresses: dresses.items || [],
        rentalDresses: dresses.items?.filter((d) => d.isRentable) || [],
        accessories: accessories.items || [],
        blogs: blogs.items || [],
      });

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã tải thông tin shop",
      });
    } catch (error) {
      console.error("Error loading shop detail:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin cửa hàng",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadShopDetail();
  }, [loadShopDetail]);

  const handleDressPress = useCallback((dress: Dress) => {
    router.push(`/dress/${dress.id}` as any);
  }, []);

  const handleAccessoryPress = useCallback((accessory: Accessory) => {
    Alert.alert("Phụ kiện", `Bạn đã chọn: ${accessory.name}`);
    // TODO: Navigate to accessory detail
  }, []);

  const handleBlogPress = useCallback((blog: any) => {
    router.push(`/blog/${blog.id}` as any);
  }, []);

  const handleContact = useCallback(() => {
    if (shop) {
      Alert.alert(
        "Liên hệ",
        `Điện thoại: ${shop.phone}\nEmail: ${shop.email}\nĐịa chỉ: ${shop.address}`,
        [
          { text: "Gọi điện", onPress: () => console.log("Call pressed") },
          { text: "Nhắn tin", onPress: () => console.log("Message pressed") },
          { text: "Đóng", style: "cancel" },
        ]
      );
    }
  }, [shop]);

  const handleChat = useCallback(() => {
    if (shop) {
      router.push(`/chat/${shop.id}` as any);
    }
  }, [shop]);

  const handleCustomRequest = useCallback(() => {
    router.push(`/account/custom-requests/create?shopId=${id}` as any);
  }, [id]);

  const handleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    Toast.show({
      type: "success",
      text1: isFavorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
    });
  }, [isFavorite]);

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.chatButton]}
        onPress={handleChat}
        activeOpacity={0.8}
      >
        <View style={styles.actionButtonContent}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Nhắn tin</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.customRequestButton]}
        onPress={handleCustomRequest}
        activeOpacity={0.8}
      >
        <View style={styles.actionButtonContent}>
          <Ionicons name="cut" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Đặt may</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderShopStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="shirt-outline" size={20} color="#E05C78" />
        </View>
        <Text style={styles.statNumber}>{products.dresses.length}</Text>
        <Text style={styles.statLabel}>Váy cưới</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="repeat-outline" size={20} color="#10B981" />
        </View>
        <Text style={styles.statNumber}>{products.rentalDresses.length}</Text>
        <Text style={styles.statLabel}>Váy thuê</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="diamond-outline" size={20} color="#8B5CF6" />
        </View>
        <Text style={styles.statNumber}>{products.accessories.length}</Text>
        <Text style={styles.statLabel}>Phụ kiện</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <View style={styles.statIconContainer}>
          <Ionicons name="newspaper-outline" size={20} color="#F59E0B" />
        </View>
        <Text style={styles.statNumber}>{products.blogs.length}</Text>
        <Text style={styles.statLabel}>Bài viết</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case "DRESS":
        return (
          <View style={styles.contentContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Váy cưới bán</Text>
              <Text style={styles.categorySubtitle}>
                {products.dresses.length} sản phẩm có sẵn
              </Text>
            </View>
            {products.dresses.length > 0 ? (
              <DressGrid
                shopId={id}
                onDressPress={handleDressPress}
                disableScroll={true}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="shirt-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>Chưa có váy cưới nào</Text>
              </View>
            )}
          </View>
        );

      case "RENTAL_DRESS":
        return (
          <View style={styles.contentContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Váy cưới cho thuê</Text>
              <Text style={styles.categorySubtitle}>
                {products.rentalDresses.length} sản phẩm có thể thuê
              </Text>
            </View>
            {products.rentalDresses.length > 0 ? (
              <DressGrid
                shopId={id}
                onDressPress={handleDressPress}
                disableScroll={true}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="repeat-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>Chưa có váy cho thuê</Text>
              </View>
            )}
          </View>
        );

      case "ACCESSORY":
        return (
          <View style={styles.contentContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Phụ kiện cưới</Text>
              <Text style={styles.categorySubtitle}>
                {products.accessories.length} sản phẩm
              </Text>
            </View>
            {products.accessories.length > 0 ? (
              <AccessoryGrid
                accessories={products.accessories}
                onAccessoryPress={handleAccessoryPress}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="diamond-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>Chưa có phụ kiện nào</Text>
              </View>
            )}
          </View>
        );

      case "BLOG":
        return (
          <View style={styles.contentContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>Bài viết</Text>
              <Text style={styles.categorySubtitle}>
                {products.blogs.length} bài viết
              </Text>
            </View>
            {products.blogs.length > 0 ? (
              <BlogList blogs={products.blogs} onBlogPress={handleBlogPress} />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="newspaper-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>Đang tải thông tin cửa hàng...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin cửa hàng</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {shop.name}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        data={[{ key: "content" }]}
        renderItem={() => (
          <>
            {/* Cover Image */}
            <View style={styles.coverContainer}>
              <Image
                source={{
                  uri:
                    shop.coverUrl ||
                    shop.images?.[0] ||
                    "https://via.placeholder.com/400x200?text=Cửa+hàng",
                }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.overlay}>
                <View style={styles.logoContainer}>
                  <Image
                    source={{
                      uri:
                        shop.logoUrl ||
                        "https://via.placeholder.com/80x80?text=Logo",
                    }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            {/* Shop Info */}
            <View style={styles.shopInfo}>
              <View style={styles.shopHeader}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <TouchableOpacity
                  style={[
                    styles.favoriteButton,
                    { backgroundColor: isFavorite ? "#EF4444" : "#F3F4F6" },
                  ]}
                  onPress={handleFavorite}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorite ? "#FFFFFF" : "#E05C78"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.shopDescription}>{shop.description}</Text>

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <View style={styles.contactIconContainer}>
                    <Ionicons name="call-outline" size={18} color="#E05C78" />
                  </View>
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Điện thoại</Text>
                    <Text style={styles.contactText}>{shop.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.contactAction}>
                    <Ionicons name="call" size={16} color="#10B981" />
                  </TouchableOpacity>
                </View>

                <View style={styles.contactItem}>
                  <View style={styles.contactIconContainer}>
                    <Ionicons name="mail-outline" size={18} color="#E05C78" />
                  </View>
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactText}>{shop.email}</Text>
                  </View>
                  <TouchableOpacity style={styles.contactAction}>
                    <Ionicons name="mail" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>

                <View style={styles.contactItem}>
                  <View style={styles.contactIconContainer}>
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#E05C78"
                    />
                  </View>
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Địa chỉ</Text>
                    <Text style={styles.contactText}>{shop.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.contactAction}>
                    <Ionicons name="navigate" size={16} color="#F59E0B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              {renderActionButtons()}

              {/* Contact Button */}
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContact}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Liên hệ ngay</Text>
              </TouchableOpacity>

              {/* Shop Stats */}
              {renderShopStats()}
            </View>

            {/* Category Tabs */}
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Content based on selected category */}
            {renderContent()}
          </>
        )}
        keyExtractor={(item) => item.key}
      />
    </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#E05C78",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    position: "relative",
    height: 200,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  shopInfo: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  shopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  shopDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  contactAction: {
    padding: 8,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E05C78",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    flex: 1,
  },
  chatButton: {
    backgroundColor: "#3B82F6",
  },
  customRequestButton: {
    backgroundColor: "#10B981",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E05C78",
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E0E0E0",
  },
  contentContainer: {
    padding: 20,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  categorySubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    marginTop: 10,
  },
});
