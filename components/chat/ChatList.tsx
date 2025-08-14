import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { ChatService } from "../../services/chat.service";
import { ChatRoom } from "../../services/types";

interface ChatListProps {
  userId: string;
  userType: "customer" | "shop";
  onChatPress: (chatId: string) => void;
}

export default function ChatList({ userType }: ChatListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isOnline } = useNetworkStatus();
  const [navigationError, setNavigationError] = useState(false);

  // Safe navigation handler with direct router usage
  const handleChatPress = useCallback((chatRoom: ChatRoom) => {
    try {
      router.push(`/chat/${chatRoom.id}`);
    } catch (error) {
      if (__DEV__) {
        console.error("Error opening chat:", error);
      }
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể mở chat. Vui lòng thử lại.",
      });
    }
  }, []);

  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setIsLoading(true);
        const rooms = await ChatService.getChatRooms(
          "test-user-id",
          "customer"
        );
        setChatRooms(rooms);
      } catch (error) {
        console.error("Error loading chat rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatRooms();
  }, []);

  // Render beautiful chat room item
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
          {/* Avatar and info row */}
          <View className="flex-row items-center">
            {/* Beautiful avatar with gradient border */}
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

              {/* Online status indicator */}
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />

              {/* Unread badge with beautiful design */}
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full min-w-[22px] h-6 items-center justify-center px-2 shadow-lg">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>

            {/* Chat room info with better layout */}
            <View className="flex-1 min-w-0">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className="text-lg font-bold text-gray-800 flex-1 mr-3"
                  numberOfLines={1}
                >
                  {otherPartyName}
                </Text>

                {/* Last message time with modern styling */}
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

              {/* Last message preview with enhanced design */}
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

                    {/* Unread indicator with modern design */}
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

          {/* Additional info row */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-xs text-green-600 font-medium">
                Đang hoạt động
              </Text>
            </View>

            {/* Chat room status */}
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

  // Beautiful loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1 justify-center items-center px-6">
          {/* Beautiful loading animation */}
          <View className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center mb-8 shadow-lg">
            <ActivityIndicator size="large" color="#E05C78" />
          </View>

          <Text className="text-xl font-bold text-gray-800 mb-3 text-center">
            Đang tải cuộc trò chuyện...
          </Text>

          <Text className="text-base text-gray-600 text-center leading-6">
            Vui lòng chờ trong giây lát
          </Text>

          {/* Firebase index status info */}
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
      </SafeAreaView>
    );
  }

  // Beautiful empty state
  if (chatRooms.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center">
            {/* Beautiful empty state icon */}
            <View className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center mb-8 shadow-lg">
              <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-inner">
                <Ionicons
                  name="chatbubble-ellipses"
                  size={48}
                  color="#E05C78"
                />
              </View>
            </View>

            <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
              Chưa có cuộc trò chuyện nào
            </Text>

            <Text className="text-base text-gray-600 text-center mb-8 leading-6 px-4">
              Bắt đầu trò chuyện với shop để được hỗ trợ và tư vấn chuyên nghiệp
            </Text>

            {/* Quick actions with modern design */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 rounded-2xl shadow-lg"
                onPress={() => console.log("Explore shops")}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Khám phá shop
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-4 rounded-2xl shadow-lg"
                onPress={() => console.log("Learn more")}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text className="text-white font-semibold text-base ml-2">
                    Tìm hiểu thêm
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Additional info */}
            <View className="mt-8 px-6">
              <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <View className="flex-row items-center">
                  <Ionicons name="bulb" size={20} color="#3B82F6" />
                  <Text className="text-blue-700 text-sm ml-2 flex-1">
                    Bạn có thể tìm thấy shop yêu thích và bắt đầu cuộc trò
                    chuyện ngay bây giờ!
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main chat list with beautiful design
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">Tin nhắn</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {chatRooms.length} cuộc trò chuyện
        </Text>
      </View>

      {/* Network status banner */}
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

      {/* Navigation error banner */}
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

      {/* Chat rooms list */}
      <FlatList
        data={chatRooms}
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
      />
      <Toast />
    </SafeAreaView>
  );
}
