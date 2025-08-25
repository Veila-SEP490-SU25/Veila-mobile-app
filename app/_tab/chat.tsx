import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatList from "../../components/chat/ChatList";
import { useAuth } from "../../providers/auth.provider";

export default function Chat() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleChatPress = useCallback(
    (chatId: string) => {
      try {
        router.push(`/chat/${chatId}`);
      } catch (error) {
        console.error("Navigation error:", error);
      }
    },
    [router]
  );

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
      <ChatList userType="customer" onChatPress={handleChatPress} />
    </SafeAreaView>
  );
}
