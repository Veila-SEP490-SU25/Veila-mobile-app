import { Ionicons } from "@expo/vector-icons";
import CheckoutPopup from "components/CheckoutPopup";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import AccessoriesDebugger from "../../components/AccessoriesDebugger";
import { useAuth } from "../../providers/auth.provider";
import { dressApi } from "../../services/apis/dress.api";
import { ChatService } from "../../services/chat.service";
import { Dress } from "../../services/types/dress.type";
import { getTokens } from "../../utils";
import { formatVNDCustom } from "../../utils/currency.util";

// Extended Dress interface for the new data structure
interface DressDetail extends Dress {
  description?: string;
  ratingCount?: number;
  feedbacks?: Array<{
    id: string;
    customer: { username: string };
    content: string;
    rating: string;
    images: string[] | null;
  }>;
}

export default function DressDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth(); // Get user from AuthProvider
  const [dress, setDress] = useState<DressDetail | null>(null);
  const [shop, setShop] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentFeedbackPage, setCurrentFeedbackPage] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [checkoutType, setCheckoutType] = useState<"SELL" | "RENT">("SELL");
  const feedbacksPerPage = 5;

  const loadDressDetail = useCallback(async () => {
    try {
      if (!id) return;
      const response = await dressApi.getDressById(id as string);

      let dressData: DressDetail;
      if ("item" in response && response.item) {
        dressData = response.item as DressDetail;
      } else {
        dressData = response as DressDetail;
      }

      setDress(dressData);

      // Lấy shop từ dữ liệu dress (user.shop)
      if (dressData?.user?.shop) {
        setShop(dressData.user.shop);
      }
    } catch (error) {
      console.error("Error loading dress detail:", error);
      setDress(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDressDetail();
  }, [loadDressDetail]);

  const handleShopPress = useCallback(() => {
    if (shop?.id) router.push(`/shop/${shop.id}` as any);
  }, [shop]);

  const handleOpenCheckout = useCallback((type: "SELL" | "RENT") => {
    setCheckoutType(type);
    setShowCheckoutPopup(true);
  }, []);

  const handleCheckoutSuccess = useCallback((orderNumber: string) => {
    // Handle different checkout statuses
    if (orderNumber === "INSUFFICIENT_BALANCE") {
      // Navigate to wallet/topup page
      Toast.show({
        type: "info",
        text1: "Chuyển hướng",
        text2: "Đang chuyển đến trang nạp tiền...",
      });

      setTimeout(() => {
        router.push("/account/wallet" as any);
      }, 1500);
    } else if (orderNumber === "VIEW_WALLET") {
      // Navigate to wallet page
      Toast.show({
        type: "info",
        text1: "Chuyển hướng",
        text2: "Đang chuyển đến trang ví...",
      });

      setTimeout(() => {
        router.push("/account/wallet" as any);
      }, 1500);
    } else if (orderNumber === "UNKNOWN_STATUS") {
      // Navigate to orders page to check status
      Toast.show({
        type: "info",
        text1: "Chuyển hướng",
        text2: "Đang chuyển đến trang đơn hàng...",
      });

      setTimeout(() => {
        router.push("/account/orders" as any);
      }, 1500);
    } else {
      // Normal success - show success message and navigate
      Toast.show({
        type: "success",
        text1: "Đặt hàng thành công!",
        text2: `Mã đơn hàng: ${orderNumber}`,
      });

      // Navigate to order confirmation or orders page
      setTimeout(() => {
        router.push("/account/orders" as any);
      }, 2000);
    }
  }, []);

  const handleChatPress = useCallback(async () => {
    try {
      setChatLoading(true);

      if (!shop?.id || !dress?.id) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tìm thấy thông tin shop hoặc váy cưới",
        });
        return;
      }

      const { accessToken } = await getTokens();
      if (!accessToken) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng đăng nhập để nhắn tin",
        });
        return;
      }

      // Tạo hoặc tham gia chat room với shop
      const chatRoomId = await ChatService.createChatRoom({
        shopId: shop.id,
        shopName: shop.name,
        customerId: user?.id || "current-user-id", // Use user.id from AuthProvider
        customerName: user?.firstName || "Khách hàng", // Use user.firstName from AuthProvider
        unreadCount: 0,
        isActive: true,
      });

      if (chatRoomId) {
        // Navigate đến chat room
        router.push(`/chat/${chatRoomId}` as any);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tạo phòng chat. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error creating chat room:", error);
      }
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể kết nối chat. Vui lòng thử lại.",
      });
    } finally {
      setChatLoading(false);
    }
  }, [shop, dress, user]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorite(!isFavorite);
    // TODO: Implement actual favorite logic with API
    if (__DEV__) {
      console.log("Toggle favorite:", !isFavorite);
    }
  }, [isFavorite]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#E05C78" />
        <Text className="mt-4 text-base text-gray-600">
          Đang tải thông tin váy cưới...
        </Text>
      </View>
    );
  }

  if (!dress) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Ionicons name="alert-circle-outline" size={64} color="#E05C78" />
        <Text className="mt-4 text-lg font-semibold text-gray-800">
          Không tìm thấy thông tin váy cưới
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary-500 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between pt-20 pb-4 px-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text
          className="text-xl font-[700] font-bold text-primary-600 flex-1 text-center mx-4"
          numberOfLines={1}
        >
          Chi tiết váy cưới
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
            onPress={handleFavoritePress}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#E05C78" : "#E05C78"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
            onPress={handleChatPress}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#E05C78"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Dress Image */}
        <View className="w-full aspect-[4/3] bg-gray-100">
          <Image
            source={{
              uri:
                dress.images?.[0] ||
                "https://via.placeholder.com/400x300?text=Váy+cưới",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Dress Info */}
        <View className="p-6">
          {/* Title and Rating */}
          <Text className="text-2xl font-bold text-gray-800 mb-3">
            {dress.name}
          </Text>

          {/* Category Badge */}
          {dress.category && (
            <View className="mb-4">
              <View className="bg-primary-50 px-3 py-2 rounded-full self-start border border-primary-200">
                <Text className="text-sm font-semibold text-primary-600">
                  {dress.category.name.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-full">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-sm font-semibold text-gray-800 ml-2">
                {dress.ratingAverage}
              </Text>
              <Text className="text-xs text-gray-500 ml-1">
                ({dress.ratingCount || 0} đánh giá)
              </Text>
            </View>
            <View className="ml-3 px-3 py-1 rounded-full bg-green-100">
              <Text className="text-xs font-semibold text-green-700">
                {dress.status === "AVAILABLE" ? "Còn hàng" : "Hết hàng"}
              </Text>
            </View>
          </View>

          {/* Description */}
          {dress.description && (
            <View className="mb-6">
              <Text className="text-sm text-gray-600 leading-6">
                {dress.description}
              </Text>
            </View>
          )}

          {/* Pricing Details - Moved Up */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Thông tin giá
            </Text>
            <View className="space-y-3">
              {dress.isSellable && (
                <View className="flex-row items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                  <View className="flex-row items-center">
                    <Ionicons name="shirt-outline" size={20} color="#E05C78" />
                    <Text className="text-base font-semibold text-gray-700 ml-2">
                      Giá mua
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-primary-500">
                    {formatVNDCustom(dress.sellPrice)}
                  </Text>
                </View>
              )}
              {dress.isRentable && (
                <View className="flex-row items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                  <View className="flex-row items-center">
                    <Ionicons name="repeat-outline" size={20} color="#10B981" />
                    <Text className="text-base font-semibold text-gray-700 ml-2">
                      Giá thuê
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-green-600">
                    {formatVNDCustom(dress.rentalPrice)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-6">
            <TouchableOpacity
              className="flex-1 bg-primary-500 rounded-2xl py-4 items-center shadow-lg"
              onPress={() => handleOpenCheckout("SELL")}
            >
              <Text className="text-white font-semibold text-lg">Mua ngay</Text>
            </TouchableOpacity>

            {dress.isRentable && (
              <TouchableOpacity
                className="flex-1 bg-secondary-500 rounded-2xl py-4 items-center shadow-lg"
                onPress={() => handleOpenCheckout("RENT")}
              >
                <Text className="text-white font-semibold text-lg">
                  Thuê váy
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Debug Section - Remove in production */}
          <AccessoriesDebugger
            dressId={dress?.id}
            shopId={dress?.user?.shop?.id}
          />

          {/* Action Buttons - Chat and Custom Order */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Tương tác với shop
            </Text>
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-2xl py-4 items-center shadow-lg"
                onPress={handleChatPress}
                activeOpacity={0.8}
                disabled={chatLoading}
              >
                {chatLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text className="text-white font-bold text-lg mt-2">
                      Nhắn tin
                    </Text>
                    <Text className="text-primary-100 text-sm mt-1">
                      Tư vấn trực tiếp
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-orange-500 rounded-2xl py-4 items-center shadow-lg"
                onPress={() =>
                  router.push("/account/custom-requests/create" as any)
                }
                activeOpacity={0.8}
              >
                <Ionicons name="cut-outline" size={20} color="#FFFFFF" />
                <Text className="text-white font-bold text-lg mt-2">
                  Đặt may
                </Text>
                <Text className="text-orange-100 text-sm mt-1">
                  Thiết kế riêng
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shop Info */}
          {shop && (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm"
              onPress={handleShopPress}
            >
              <View className="flex-row items-center">
                <Image
                  source={{
                    uri:
                      shop.logoUrl ||
                      "https://via.placeholder.com/60x60?text=Logo",
                  }}
                  className="w-12 h-12 rounded-full bg-gray-100 mr-3"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800 mb-1">
                    {shop.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {shop.address}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-sm text-gray-600 ml-2 font-medium">
                      Đánh giá: {shop.reputation || 0}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#E05C78" />
              </View>
            </TouchableOpacity>
          )}

          {/* Feedbacks Section */}
          {dress.feedbacks && dress.feedbacks.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">
                  Đánh giá từ khách hàng
                </Text>
                <Text className="text-sm text-gray-500">
                  ({dress.feedbacks.length} đánh giá)
                </Text>
              </View>

              {/* Rating Summary */}
              <View className="bg-yellow-50 rounded-2xl p-4 mb-4 border border-yellow-200">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={20} color="#F59E0B" />
                    <Text className="text-2xl font-bold text-gray-800 ml-2">
                      {dress.ratingAverage}
                    </Text>
                    <Text className="text-sm text-gray-600 ml-2">/ 5.0</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-600">Tổng cộng</Text>
                    <Text className="text-lg font-bold text-gray-800">
                      {dress.ratingCount} đánh giá
                    </Text>
                  </View>
                </View>

                {/* Rating Distribution */}
                <View className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count =
                      dress.feedbacks?.filter(
                        (f) => Math.floor(parseFloat(f.rating)) === rating
                      ).length || 0;
                    const percentage = dress.ratingCount
                      ? Math.round((count / dress.ratingCount) * 100)
                      : 0;
                    return (
                      <View key={rating} className="flex-row items-center">
                        <Text className="text-xs text-gray-600 w-4">
                          {rating}⭐
                        </Text>
                        <View className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                          <View
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-600 w-8 text-right">
                          {count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Feedbacks List */}
              <View className="space-y-3">
                {dress.feedbacks
                  ?.slice(
                    currentFeedbackPage * feedbacksPerPage,
                    (currentFeedbackPage + 1) * feedbacksPerPage
                  )
                  .map((feedback, index) => (
                    <View
                      key={feedback.id}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-3">
                            <Text className="text-xs font-bold text-primary-600">
                              {feedback.customer.username
                                .charAt(0)
                                .toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <Text className="text-sm font-semibold text-gray-700">
                              {feedback.customer.username}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              Đánh giá #
                              {currentFeedbackPage * feedbacksPerPage +
                                index +
                                1}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text className="text-xs text-gray-700 ml-1 font-medium">
                            {feedback.rating}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-gray-600 leading-5">
                        {feedback.content}
                      </Text>
                    </View>
                  ))}
              </View>

              {/* Pagination Controls */}
              {dress.feedbacks && dress.feedbacks.length > feedbacksPerPage && (
                <View className="mt-4 flex-row items-center justify-between">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${
                      currentFeedbackPage === 0
                        ? "bg-gray-200"
                        : "bg-primary-500"
                    }`}
                    onPress={() =>
                      setCurrentFeedbackPage(
                        Math.max(0, currentFeedbackPage - 1)
                      )
                    }
                    disabled={currentFeedbackPage === 0}
                  >
                    <Text
                      className={`font-semibold ${
                        currentFeedbackPage === 0
                          ? "text-gray-500"
                          : "text-white"
                      }`}
                    >
                      Trước
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-sm text-gray-600">
                    Trang {currentFeedbackPage + 1} /{" "}
                    {Math.ceil(
                      (dress.feedbacks?.length || 0) / feedbacksPerPage
                    )}
                  </Text>

                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${
                      currentFeedbackPage >=
                      Math.ceil(
                        (dress.feedbacks?.length || 0) / feedbacksPerPage
                      ) -
                        1
                        ? "bg-gray-200"
                        : "bg-primary-500"
                    }`}
                    onPress={() =>
                      setCurrentFeedbackPage(
                        Math.min(
                          Math.ceil(
                            (dress.feedbacks?.length || 0) / feedbacksPerPage
                          ) - 1,
                          currentFeedbackPage + 1
                        )
                      )
                    }
                    disabled={
                      currentFeedbackPage >=
                      Math.ceil(
                        (dress.feedbacks?.length || 0) / feedbacksPerPage
                      ) -
                        1
                    }
                  >
                    <Text
                      className={`font-semibold ${
                        currentFeedbackPage >=
                        Math.ceil(
                          (dress.feedbacks?.length || 0) / feedbacksPerPage
                        ) -
                          1
                          ? "text-gray-500"
                          : "text-white"
                      }`}
                    >
                      Sau
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Checkout Popup */}
      <CheckoutPopup
        visible={showCheckoutPopup}
        onClose={() => setShowCheckoutPopup(false)}
        dressId={dress?.id || ""}
        type={checkoutType}
        onSuccess={handleCheckoutSuccess}
        shopId={dress?.user?.shop?.id}
      />
    </View>
  );
}
