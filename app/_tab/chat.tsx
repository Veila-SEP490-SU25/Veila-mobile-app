import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/auth.provider";

// Simple mock data for testing
const mockChatRooms = [
  {
    id: "1",
    name: "Shop Váy Cưới Đẹp",
    lastMessage: "Chào bạn! Bạn cần tư vấn gì về váy cưới?",
    time: "2 phút trước",
    unread: 2,
  },
  {
    id: "2",
    name: "Bridal Boutique",
    lastMessage: "Váy của bạn đã sẵn sàng để thử",
    time: "1 giờ trước",
    unread: 0,
  },
  {
    id: "3",
    name: "Wedding Dress Store",
    lastMessage: "Cảm ơn bạn đã mua hàng!",
    time: "1 ngày trước",
    unread: 1,
  },
];

export default function Chat() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [chatRooms] = useState(mockChatRooms);

  if (isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-600">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleChatPress = (chatId: string) => {
    console.log("Chat pressed:", chatId);
    // Navigate to chat detail using expo-router
    router.push(`/chat/${chatId}`);
  };

  const renderChatRoom = ({ item }: { item: (typeof mockChatRooms)[0] }) => (
    <TouchableOpacity
      className="mx-4 mb-3 bg-white rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50"
      onPress={() => handleChatPress(item.id)}
      activeOpacity={0.8}
    >
      <View className="p-4">
        <View className="flex-row items-center">
          <View className="relative mr-4">
            <View className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 p-0.5">
              <View className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center border-2 border-white">
                <Text className="text-white font-bold text-xl">
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>

            {item.unread > 0 && (
              <View className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full min-w-[22px] h-6 items-center justify-center px-2 shadow-lg">
                <Text className="text-white text-xs font-bold">
                  {item.unread > 99 ? "99+" : item.unread}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 min-w-0">
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-lg font-bold text-gray-800 flex-1 mr-3"
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <View className="bg-gray-50 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-600 font-medium">
                  {item.time}
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 leading-5" numberOfLines={2}>
              {item.lastMessage}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Tin nhắn</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Quản lý tin nhắn và thông báo
        </Text>
      </View>

      {/* Chat List */}
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Empty State */}
      {chatRooms.length === 0 && (
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            Chưa có tin nhắn
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Bạn chưa có cuộc trò chuyện nào. Hãy bắt đầu chat với shop để được
            tư vấn!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
