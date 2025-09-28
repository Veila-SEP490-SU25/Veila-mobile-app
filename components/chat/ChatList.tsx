import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Toast from "react-native-toast-message";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useChatContext } from "../../providers/chat.provider";
import { ChatRoom } from "../../services/types";

interface ChatListProps {
  userId?: string;
  userType?: "customer" | "shop";
  onChatPress?: (chatId: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function ChatList({
  userType = "customer",
  onChatPress,
  onRefresh,
  refreshing = false,
}: ChatListProps) {
  const { chatRooms, loading: isLoading, error } = useChatContext();
  const router = useRouter();

  const { isOnline } = useNetworkStatus();
  const [navigationError, setNavigationError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [localRefreshing, setLocalRefreshing] = useState(false);

  // Sử dụng prop refreshing hoặc local state
  const isRefreshing = refreshing || localRefreshing;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle refresh nếu không có onRefresh prop
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Local refresh: reload chat rooms từ context
      setLocalRefreshing(true);
      try {
        // Trigger refresh bằng cách gọi lại context
        // ChatProvider sẽ tự động refresh khi user thay đổi
      } finally {
        setTimeout(() => setLocalRefreshing(false), 1000);
      }
    }
  }, [onRefresh]);

  // Filter chat rooms based on debounced search query
  const filteredChatRooms = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return chatRooms;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return chatRooms.filter((room) => {
      const otherPartyName =
        userType === "customer" ? room.shopName : room.customerName;
      const lastMessage = room.lastMessage?.content || "";

      return (
        otherPartyName?.toLowerCase().includes(query) ||
        lastMessage.toLowerCase().includes(query)
      );
    });
  }, [chatRooms, debouncedSearchQuery, userType]);

  const handleChatPress = useCallback(
    (chatRoom: ChatRoom) => {
      try {
        if (onChatPress) {
          onChatPress(chatRoom.id);
        }
      } catch {
        setNavigationError(true);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể mở chat. Vui lòng thử lại.",
        });
      }
    },
    [onChatPress]
  );

  const handleShopPress = useCallback(
    (chatRoom: ChatRoom) => {
      try {
        if (userType === "customer") {
          router.push(`/shop/${chatRoom.shopId}` as any);
        } else {
          router.push(`/customer/${chatRoom.customerId}` as any);
        }
      } catch (error) {
        console.error("Error navigating:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể chuyển đến trang. Vui lòng thử lại.",
        });
      }
    },
    [router, userType]
  );

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const otherPartyName =
      userType === "customer" ? item.shopName : item.customerName;
    const otherPartyAvatar =
      userType === "customer" ? item.shopAvatar : item.customerAvatar;
    const lastMessage = item.lastMessage;
    const unreadCount = item.unreadCount;

    return (
      <TouchableOpacity
        className="mx-4 mb-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50"
        onPress={() => handleChatPress(item)}
        activeOpacity={0.8}
      >
        <View className="p-4">
          <View className="flex-row items-center">
            <View className="relative mr-4">
              <View className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-0.5">
                {otherPartyAvatar ? (
                  <Image
                    source={{ uri: otherPartyAvatar }}
                    className="w-full h-full rounded-full border-2 border-white"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center border-2 border-white">
                    <Text className="text-white font-bold text-xl">
                      {otherPartyName?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </View>

              <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />

              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full min-w-[22px] h-6 items-center justify-center px-2 shadow-lg">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-1 min-w-0">
              <View className="flex-row justify-between items-center mb-2">
                <TouchableOpacity
                  onPress={() => handleShopPress(item)}
                  activeOpacity={0.7}
                  className="flex-1 mr-3"
                >
                  <View className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <Text
                      className="text-lg font-bold text-gray-800"
                      numberOfLines={1}
                    >
                      {otherPartyName}
                    </Text>

                    {userType === "customer" && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="storefront" size={12} color="#E05C78" />
                        <Text className="text-xs text-primary-600 ml-1 font-medium">
                          Click để xem shop
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {lastMessage && lastMessage.timestamp && (
                  <View className="bg-gray-50 px-2 py-1 rounded-full">
                    <Text className="text-xs text-gray-600 font-medium">
                      {(() => {
                        try {
                          const timestamp =
                            lastMessage.timestamp instanceof Date
                              ? lastMessage.timestamp
                              : new Date(lastMessage.timestamp);
                          return formatDistanceToNow(timestamp, {
                            addSuffix: true,
                            locale: vi,
                          });
                        } catch {
                          return "Vừa xong";
                        }
                      })()}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center">
                {lastMessage ? (
                  <>
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-sm text-gray-600 leading-5"
                        numberOfLines={2}
                      >
                        <Text className="font-semibold text-gray-700">
                          {lastMessage.senderName}:{" "}
                        </Text>
                        {lastMessage.content}
                      </Text>
                    </View>

                    {unreadCount > 0 && (
                      <View className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm" />
                    )}
                  </>
                ) : (
                  <Text className="text-sm text-gray-400 italic leading-5">
                    Chưa có tin nhắn nào
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-xs text-green-600 font-medium">
                Đang hoạt động
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="chatbubble-ellipses" size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">
                {item.isActive ? "Hoạt động" : "Không hoạt động"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center mb-8 shadow-lg">
          <ActivityIndicator size="large" color="#E05C78" />
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-3 text-center">
          Đang tải cuộc trò chuyện...
        </Text>

        <Text className="text-base text-gray-600 text-center leading-6">
          Vui lòng chờ trong giây lát
        </Text>

        <View className="mt-6 px-6">
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-blue-700 text-sm ml-2 flex-1">
                Đang tối ưu hóa hiệu suất chat. Có thể mất vài phút để hoàn
                thành.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center mb-8 shadow-lg">
          <Ionicons name="chatbubble-ellipses" size={48} color="#9CA3AF" />
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-3 text-center">
          Chưa có cuộc trò chuyện nào
        </Text>

        <Text className="text-base text-gray-600 text-center leading-6">
          Bắt đầu trò chuyện với shop để được tư vấn về váy cưới
        </Text>

        <TouchableOpacity
          onPress={handleRefresh}
          className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">Làm mới</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredChatRooms.length === 0 && debouncedSearchQuery.trim()) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center">
          <View className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center mb-8 shadow-lg">
            <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-inner">
              <Ionicons name="search" size={48} color="#9CA3AF" />
            </View>
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            Không tìm thấy kết quả
          </Text>

          <Text className="text-base text-gray-600 text-center mb-8 leading-6 px-4">
            Không có cuộc trò chuyện nào phù hợp với từ khóa "
            {debouncedSearchQuery}"
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 rounded-2xl shadow-lg"
              onPress={clearSearch}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base ml-2">
                  Xóa tìm kiếm
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="mx-4 mt-2 mb-3">
        <View className="relative">
          <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
            <Ionicons name="search" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-3 text-base text-gray-800"
            placeholder="Tìm kiếm chat..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              className="absolute right-3 top-0 bottom-0 justify-center z-10"
              onPress={clearSearch}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {debouncedSearchQuery.trim() && (
          <View className="mt-2 px-2">
            <Text className="text-sm text-gray-600">
              Tìm thấy {filteredChatRooms.length} cuộc trò chuyện
              {filteredChatRooms.length !== chatRooms.length && (
                <Text className="text-gray-500">
                  {" "}
                  trong tổng số {chatRooms.length}
                </Text>
              )}
            </Text>
          </View>
        )}
      </View>

      {!isOnline && (
        <View className="bg-yellow-50 border border-yellow-200 mx-4 mt-2 rounded-lg p-3">
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-yellow-500 rounded-full items-center justify-center mr-2">
              <Ionicons name="wifi-outline" size={12} color="#FFFFFF" />
            </View>
            <Text className="flex-1 text-yellow-700 text-sm">
              Đang ở chế độ offline. Tin nhắn sẽ được đồng bộ khi có kết nối.
            </Text>
          </View>
        </View>
      )}

      {navigationError && (
        <View className="bg-red-50 border border-red-200 mx-4 mt-2 rounded-lg p-3">
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center mr-2">
              <Text className="text-white text-xs font-bold">!</Text>
            </View>
            <Text className="flex-1 text-red-700 text-sm">
              Có vấn đề với điều hướng. Vui lòng thử lại.
            </Text>
            <TouchableOpacity
              onPress={() => setNavigationError(false)}
              className="ml-2 p-1"
            >
              <Ionicons name="close" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && (
        <View className="bg-red-50 border border-red-200 mx-4 mt-2 rounded-lg p-3">
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center mr-2">
              <Ionicons name="warning" size={12} color="#FFFFFF" />
            </View>
            <Text className="flex-1 text-red-700 text-sm">{error}</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              className="ml-2 px-3 py-1 bg-red-500 rounded-lg"
            >
              <Text className="text-white text-xs font-semibold">Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filteredChatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
      />
    </View>
  );
}
