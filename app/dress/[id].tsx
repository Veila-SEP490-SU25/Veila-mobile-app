import { Ionicons } from "@expo/vector-icons";
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
import { useFavoriteSync } from "../../hooks/useFavoriteSync";
import { useAuth } from "../../providers/auth.provider";
import { dressApi } from "../../services/apis/dress.api";
import { ChatService } from "../../services/chat.service";
import { Dress } from "../../services/types/dress.type";
import { formatVNDCustom } from "../../utils/currency.util";
import {
  showMessage,
  showOrderSuccess,
  showWalletError,
} from "../../utils/message.util";
import { getTokens } from "../../utils/token.util";

interface DressDetail extends Dress {
  description?: string;
  ratingCount?: number;
  feedbacks?: Array<{
    id: string;
    customer: { id: string; username: string; avatarUrl: string | null };
    content: string;
    rating: string;
    images: string | null;
  }>;
  bust?: string | null;
  waist?: string | null;
  hip?: string | null;
  material?: string | null;
  color?: string | null;
  length?: string | null;
  neckline?: string | null;
  sleeve?: string | null;
}

export default function DressDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isDressFavorite, syncFavoriteStatus } = useFavoriteSync();
  // State
  const [dress, setDress] = useState<DressDetail | null>(null);
  const [shop, setShop] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

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

      if (dressData?.isFavorite !== undefined) {
        setIsFavorite(dressData.isFavorite);
      } else {
        setIsFavorite(isDressFavorite(dressData.id));
      }

      if (dressData?.user?.shop) {
        setShop(dressData.user.shop);
      }
    } catch (error) {
      console.error("Error loading dress detail:", error);
      setDress(null);
    } finally {
      setLoading(false);
    }
  }, [id, isDressFavorite]);

  useEffect(() => {
    loadDressDetail();
  }, [loadDressDetail]);

  const handleShopPress = useCallback(() => {
    if (shop?.id) router.push(`/shop/${shop.id}` as any);
  }, [shop]);

  const handleOpenCheckout = useCallback(
    (type: "SELL" | "RENT") => {
      // Navigate to checkout page instead of opening popup
      router.push(
        `/checkout?dressId=${id}&type=${type}&shopId=${shop?.id}` as any
      );
    },
    [id, shop?.id, router]
  );

  const handleCheckoutSuccess = useCallback((orderNumber: string) => {
    if (orderNumber === "INSUFFICIENT_BALANCE") {
      showWalletError();

      setTimeout(() => {
        router.push("/account/wallet" as any);
      }, 1500);
    } else if (orderNumber === "VIEW_WALLET") {
      setTimeout(() => {
        router.push("/account/wallet" as any);
      }, 1500);
    } else if (orderNumber === "UNKNOWN_STATUS") {
      setTimeout(() => {
        router.push("/account/orders" as any);
      }, 1500);
    } else {
      showOrderSuccess();

      setTimeout(() => {
        router.push("/account/orders" as any);
      }, 2000);
    }
  }, []);

  const handleChatPress = useCallback(async () => {
    try {
      setChatLoading(true);

      if (!shop?.id || !dress?.id) {
        showMessage("ERM006");
        return;
      }

      const { accessToken } = await getTokens();
      if (!accessToken) {
        showMessage("SSM001");
        return;
      }

      const chatRoomId = await ChatService.createChatRoom({
        shopId: shop.id,
        shopName: shop.name,
        customerId: user?.id || "current-user-id",
        customerName: user?.firstName || "Khách hàng",
        unreadCount: 0,
        isActive: true,
      });

      if (chatRoomId) {
        router.push(`/chat/${chatRoomId}` as any);
      } else {
        showMessage("ERM006");
      }
    } catch {
      showMessage("ERM006");
    } finally {
      setChatLoading(false);
    }
  }, [shop, dress, user]);

  const handleFavoritePress = useCallback(async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      await dressApi.toggleFavorite(id as string);

      // Sync with user context
      await syncFavoriteStatus(id as string, "dress", newFavoriteStatus);

      // Show success toast
      showMessage(
        "SUC004",
        newFavoriteStatus
          ? "Đã thêm váy vào danh sách yêu thích"
          : "Đã bỏ váy khỏi danh sách yêu thích"
      );
    } catch {
      showMessage("ERM006", "Không thể cập nhật yêu thích");
      setIsFavorite(isFavorite); // Revert on error
    }
  }, [id, isFavorite, syncFavoriteStatus]);

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
          className="text-xl  font-[700] font-bold text-primary-600 flex-1 text-center mx-4"
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
              <Text className="text-lg font-bold text-primary-600 mb-2">
                Mô tả váy cưới
              </Text>
              <Text className="text-sm text-gray-600 leading-6">
                {dress.description}
              </Text>
            </View>
          )}

          <Text className="text-lg font-bold text-primary-600 mb-2">
            Thông tin chi tiết
          </Text>
          {dress.bust ? (
            <Text className="text-sm text-gray-600 leading-6">
              Vòng ngực: {dress.bust}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Vòng ngực: Đang cập nhật
            </Text>
          )}
          {dress.waist ? (
            <Text className="text-sm text-gray-600 leading-6">
              Vòng eo: {dress.waist}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Vòng eo: Đang cập nhật
            </Text>
          )}
          {dress.hip ? (
            <Text className="text-sm text-gray-600 leading-6">
              Vòng hông: {dress.hip}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Vòng hông: Đang cập nhật
            </Text>
          )}
          {dress.material ? (
            <Text className="text-sm text-gray-600 leading-6">
              Chất liệu: {dress.material}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Chất liệu: Đang cập nhật
            </Text>
          )}
          {dress.color ? (
            <Text className="text-sm text-gray-600 leading-6">
              Màu sắc: {dress.color}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Màu sắc: Đang cập nhật
            </Text>
          )}
          {dress.length ? (
            <Text className="text-sm text-gray-600 leading-6">
              Chiều dài: {dress.length}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Chiều dài: Đang cập nhật
            </Text>
          )}
          {dress.neckline ? (
            <Text className="text-sm text-gray-600 leading-6">
              Cổ áo: {dress.neckline}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Cổ áo: Đang cập nhật
            </Text>
          )}
          {dress.sleeve ? (
            <Text className="text-sm text-gray-600 leading-6">
              Tay áo: {dress.sleeve}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600 leading-6">
              Tay áo: Đang cập nhật
            </Text>
          )}

          {/* Pricing Details - Moved Up */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6 mt-4">
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
          <View className="flex-row space-x-3 mb-6">
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
                  router.push(
                    `/account/custom-requests/create-with-shop?shopId=${dress?.user?.shop?.id}` as any
                  )
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
                    0, // Removed currentFeedbackPage * feedbacksPerPage
                    5 // Removed (currentFeedbackPage + 1) * feedbacksPerPage
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
                              Đánh giá #{index + 1}
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
              {dress.feedbacks && dress.feedbacks.length > 5 && (
                <View className="mt-4 flex-row items-center justify-between">
                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${
                      // Removed currentFeedbackPage === 0
                      false ? "bg-gray-200" : "bg-primary-500"
                    }`}
                    onPress={() =>
                      // Removed setCurrentFeedbackPage(Math.max(0, currentFeedbackPage - 1))
                      null
                    }
                    disabled={true} // Removed currentFeedbackPage === 0
                  >
                    <Text
                      className={`font-semibold ${
                        // Removed currentFeedbackPage === 0
                        true ? "text-gray-500" : "text-white"
                      }`}
                    >
                      Trước
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-sm text-gray-600">
                    Trang 1 / {Math.ceil((dress.feedbacks?.length || 0) / 5)}
                  </Text>

                  <TouchableOpacity
                    className={`px-4 py-2 rounded-lg ${
                      // Removed currentFeedbackPage >= Math.ceil((dress.feedbacks?.length || 0) / feedbacksPerPage) - 1
                      false ? "bg-gray-200" : "bg-primary-500"
                    }`}
                    onPress={() =>
                      // Removed setCurrentFeedbackPage(Math.min(Math.ceil((dress.feedbacks?.length || 0) / feedbacksPerPage) - 1, currentFeedbackPage + 1))
                      null
                    }
                    disabled={true} // Removed currentFeedbackPage >= Math.ceil((dress.feedbacks?.length || 0) / feedbacksPerPage) - 1
                  >
                    <Text
                      className={`font-semibold ${
                        // Removed currentFeedbackPage >= Math.ceil((dress.feedbacks?.length || 0) / feedbacksPerPage) - 1
                        true ? "text-gray-500" : "text-white"
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
      {/* Removed CheckoutPopup component */}
    </View>
  );
}
