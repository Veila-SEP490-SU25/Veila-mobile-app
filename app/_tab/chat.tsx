import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatList from "../../components/chat/ChatList";
import { useAuth } from "../../providers/auth.provider";
import { useChatContext } from "../../providers/chat.provider";

export default function Chat() {
  const { user, isLoading } = useAuth();
  const { chatRooms, refreshChatRooms } = useChatContext();
  const router = useRouter();

  const handleChatPress = useCallback(
    (chatId: string) => {
      try {
        router.push(`/chat/${chatId}`);
      } catch {}
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshChatRooms();
    } catch (error) {
      console.warn("Error refreshing chat rooms:", error);
    }
  }, [refreshChatRooms]);

  const handleShopPress = useCallback(
    (shopId: string, _customerId?: string) => {
      try {
        if (!shopId || shopId.trim() === "") {
          return;
        }
        router.push(`/shop/${shopId}`);
      } catch {
        // Silent fail
      }
    },
    [router]
  );

  const totalUnreadMessages = chatRooms.reduce((total, room) => {
    return total + (room.unreadCount || 0);
  }, 0);

  if (isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">Tin nhắn</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {totalUnreadMessages > 0
            ? `${totalUnreadMessages} tin nhắn chưa đọc`
            : `${chatRooms.length} cuộc trò chuyện`}
        </Text>
      </View>

      <ChatList
        userType="customer"
        onChatPress={handleChatPress}
        onShopPress={handleShopPress}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}
