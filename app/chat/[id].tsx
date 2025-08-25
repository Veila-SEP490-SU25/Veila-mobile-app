import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/auth.provider";
import { ChatService } from "../../services/chat.service";
import { ChatMessage, ChatRoom } from "../../services/types";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Get user from AuthProvider

  // Safely get params with error handling
  let chatRoomId: string | null = null;
  let paramsError: string | null = null;

  try {
    const params = useLocalSearchParams<{ id: string }>();
    chatRoomId = params?.id || null;
    if (!chatRoomId) {
      paramsError = "Không thể tìm thấy ID phòng chat";
    }
  } catch (error) {
    console.error("Navigation context error:", error);
    paramsError = "Lỗi navigation context";
  }

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Loading states
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Remove debug logs

  // Validate navigation context
  useEffect(() => {
    if (!router) {
      setError("Navigation context không khả dụng");
      setLoading(false);
      return;
    }

    if (paramsError) {
      setError(paramsError);
      setLoading(false);
      return;
    }

    if (!chatRoomId) {
      setError("Không thể tìm thấy ID phòng chat");
      setLoading(false);
      return;
    }

    if (!user) {
      setError("Vui lòng đăng nhập để sử dụng chat");
      setLoading(false);
      return;
    }
  }, [router, chatRoomId, user, paramsError]);

  // Load chat room
  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        setError(null);

        if (!chatRoomId || !router || !user) {
          return;
        }

        // Get chat room details
        const room = await ChatService.getChatRoom(chatRoomId);
        if (room) {
          setChatRoom(room);
        } else {
          setError("Không thể tìm thấy phòng chat");
        }
      } catch (error) {
        console.error("Error loading chat room:", error);
        setError("Không thể tải thông tin chat");
      }
    };

    loadChatRoom();
  }, [chatRoomId, router, user]);

  // Subscribe to messages with improved error handling
  useEffect(() => {
    if (!chatRoomId || !router || !user) return;

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = () => {
      try {
        unsubscribe = ChatService.subscribeToMessages(
          chatRoomId,
          (newMessages) => {
            // If no messages, add test messages for UI testing
            if (newMessages.length === 0 && __DEV__) {
              const testMessages: ChatMessage[] = [
                {
                  id: "test-1",
                  chatRoomId,
                  senderId: "test-shop-id",
                  senderName: "Kshlerin - Ziemann",
                  content: "Chào bạn! Bạn cần tư vấn gì về váy cưới không?",
                  timestamp: new Date(Date.now() - 300000), // 5 mins ago
                  isRead: false,
                  type: "text",
                },
                {
                  id: "test-2",
                  chatRoomId,
                  senderId: user?.id || "test-customer",
                  senderName: user?.firstName || "Khách hàng",
                  content:
                    "Xin chào shop! Tôi muốn xem váy cưới cho đám cưới tháng 12.",
                  timestamp: new Date(Date.now() - 240000), // 4 mins ago
                  isRead: true,
                  type: "text",
                },
                {
                  id: "test-3",
                  chatRoomId,
                  senderId: "test-shop-id",
                  senderName: "Kshlerin - Ziemann",
                  content:
                    "Tuyệt vời! Chúng tôi có nhiều mẫu váy đẹp phù hợp cho mùa đông. Bạn có kích thước và phong cách yêu thích không?",
                  timestamp: new Date(Date.now() - 180000), // 3 mins ago
                  isRead: false,
                  type: "text",
                },
              ];
              setMessages(testMessages);
            } else {
              setMessages(newMessages);
            }

            setLoading(false);
            setError(null);
          }
        );
      } catch (error) {
        console.warn("Error setting up chat subscription:", error);
        // Use fallback mode instead of showing error
        setLoading(false);
      }
    };

    // Try to setup subscription with retry
    const retrySubscription = () => {
      try {
        setupSubscription();
      } catch (error) {
        console.warn("Retry subscription failed:", error);
        // Continue with fallback mode
        setLoading(false);
      }
    };

    retrySubscription();

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.warn("Error unsubscribing:", error);
        }
      }
    };
  }, [chatRoomId, router, user]);

  // Mark messages as read
  useEffect(() => {
    if (chatRoomId && user && router) {
      ChatService.markMessagesAsRead(chatRoomId, user.id);
    }
  }, [chatRoomId, user, router, messages]);

  // Handle send message with improved error handling
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !chatRoomId || !user || sending) return;

    try {
      setSending(true);
      setError(null);

      const messageData = {
        content: messageText.trim(),
        type: "text" as const,
      };

      // Optimistic update
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        chatRoomId,
        senderId: user.id,
        senderName: user.firstName || "Khách hàng",
        senderAvatar: user.avatarUrl,
        content: messageData.content,
        timestamp: new Date(),
        isRead: false,
        type: messageData.type,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setMessageText("");

      // Send to Firebase
      const success = await ChatService.sendMessage(
        {
          chatRoomId,
          content: messageData.content,
          type: messageData.type,
        },
        {
          senderId: user.id,
          senderName: user.firstName || "Khách hàng",
          senderAvatar: user.avatarUrl,
        }
      );

      if (!success) {
        // Remove temp message if failed
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Lỗi gửi tin nhắn. Vui lòng thử lại.");

      // Remove temp message
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setSending(false);
    }
  }, [messageText, chatRoomId, user, sending]);

  // Retry connection
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    setError(null);

    try {
      // Reload chat room
      if (chatRoomId && router && user) {
        const room = await ChatService.getChatRoom(chatRoomId);
        if (room) {
          setChatRoom(room);
        }
      }

      // Reset loading state
      setLoading(false);
    } catch {
      setError("Không thể kết nối lại. Vui lòng thử lại sau.");
    } finally {
      setRetrying(false);
    }
  }, [chatRoomId, router, user]);

  // Render message with beautiful modern design
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isOwnMessage = item.senderId === user?.id;
      const messageTime = new Date(item.timestamp).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <View
          className={`flex-row mb-4 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          {/* Avatar for other messages */}
          {!isOwnMessage && (
            <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-2 mt-1">
              <Text className="text-gray-700 font-semibold text-sm">
                {item.senderName?.charAt(0)?.toUpperCase() || "S"}
              </Text>
            </View>
          )}

          <View
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              isOwnMessage
                ? "bg-blue-500 rounded-br-md shadow-lg"
                : "bg-gray-100 rounded-bl-md shadow-sm border border-gray-200"
            }`}
          >
            {/* Sender name for other messages */}
            {!isOwnMessage && (
              <Text
                className={`text-xs mb-2 font-semibold text-gray-700`}
                numberOfLines={1}
              >
                {item.senderName || "Shop"}
              </Text>
            )}

            {/* Message content with proper text wrapping */}
            <Text
              className={`text-base leading-6 ${
                isOwnMessage ? "text-white" : "text-gray-900"
              }`}
              style={{ textAlign: "left" }}
            >
              {item.content}
            </Text>

            {/* Message time and status */}
            <View className="flex-row items-center justify-between mt-3">
              <Text
                className={`text-xs ${
                  isOwnMessage ? "text-blue-100" : "text-gray-600"
                }`}
              >
                {messageTime}
              </Text>

              {/* Read status for own messages */}
              {isOwnMessage && (
                <View className="flex-row items-center ml-2">
                  <Ionicons
                    name={item.isRead ? "checkmark-done" : "checkmark"}
                    size={14}
                    color={item.isRead ? "#10B981" : "#FFFFFF"}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Avatar for own messages */}
          {isOwnMessage && (
            <View className="w-8 h-8 rounded-full bg-blue-200 items-center justify-center ml-2 mt-1">
              <Text className="text-blue-700 font-semibold text-sm">
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [user?.id, user?.firstName]
  );

  // Render header with improved UI and fixed layout
  const renderHeader = () => {
    if (!chatRoom || !user) return null;

    const otherPartyName =
      chatRoom.customerId === user.id
        ? chatRoom.shopName
        : chatRoom.customerName;

    const otherPartyAvatar =
      chatRoom.customerId === user.id
        ? chatRoom.shopAvatar
        : chatRoom.customerAvatar;

    return (
      <SafeAreaView className="bg-white border-b border-gray-200 shadow-sm">
        <View className="flex-row items-center p-4">
          {/* Back button */}
          <TouchableOpacity
            className="mr-3 p-2 rounded-full bg-gray-100"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>

          {/* User info with fixed layout */}
          <View className="flex-1 flex-row items-center min-w-0">
            {otherPartyAvatar ? (
              <Image
                source={{ uri: otherPartyAvatar }}
                className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200"
                resizeMode="cover"
              />
            ) : (
              <View className="w-10 h-10 rounded-full mr-3 bg-primary-100 items-center justify-center border-2 border-gray-200">
                <Text className="text-primary-600 font-semibold text-lg">
                  {otherPartyName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}

            {/* User details with proper text wrapping */}
            <View className="flex-1 min-w-0">
              <Text
                className="text-lg font-semibold text-gray-800 mb-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {otherPartyName || "Shop"}
              </Text>

              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-sm text-green-600 font-medium">
                  Đang hoạt động
                </Text>
              </View>
            </View>
          </View>

          {/* Menu button */}
          <TouchableOpacity
            className="ml-3 p-2 rounded-full bg-gray-100"
            onPress={() => console.log("Menu pressed")}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  // Render input bar with beautiful modern design
  const renderInput = () => (
    <SafeAreaView
      className="bg-white border-t border-gray-100"
      edges={["bottom"]}
    >
      {/* Error banner if there's an error */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl mx-4 mb-3 mt-2">
          <View className="flex-row items-center p-3">
            <View className="w-5 h-5 bg-red-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-bold">!</Text>
            </View>
            <Text className="flex-1 text-red-700 text-sm">
              {error.length > 50 ? `${error.substring(0, 50)}...` : error}
            </Text>
            <TouchableOpacity
              onPress={() => setError(null)}
              className="ml-2 p-1"
            >
              <Ionicons name="close" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row items-center p-4 space-x-3">
        {/* Attachment button with modern design */}
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 items-center justify-center shadow-sm"
          onPress={() => console.log("Attachment pressed")}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#666" />
        </TouchableOpacity>

        {/* Message input with modern styling */}
        <View className="flex-1">
          <TextInput
            className="bg-gray-50 rounded-2xl px-4 py-3 text-base text-gray-800 border border-gray-200"
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            style={{
              minHeight: 48,
              maxHeight: 100,
            }}
          />
        </View>

        {/* Send button with gradient design */}
        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center shadow-lg ${
            messageText.trim()
              ? "bg-gradient-to-r from-primary-500 to-primary-600"
              : "bg-gray-300"
          }`}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={messageText.trim() ? "#FFFFFF" : "#999"}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Render empty state with beautiful modern design
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-20">
      {/* Beautiful icon container */}
      <View className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center mb-8 shadow-lg">
        <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-inner">
          <Ionicons name="chatbubble-ellipses" size={48} color="#E05C78" />
        </View>
      </View>

      {/* Main title with modern typography */}
      <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
        Chưa có tin nhắn nào
      </Text>

      {/* Subtitle with better spacing */}
      <Text className="text-base text-gray-600 text-center px-4 mb-8 leading-6">
        Bắt đầu cuộc trò chuyện với shop để được hỗ trợ và tư vấn
      </Text>

      {/* Quick actions with modern button design */}
      <View className="flex-row gap-4 mt-6">
        <TouchableOpacity
          className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 rounded-2xl shadow-lg"
          onPress={() => handleQuickMessage("Xin chào!")}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="hand-left" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base ml-2">
              Xin chào!
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4 rounded-2xl shadow-lg"
          onPress={() => handleQuickMessage("Tư vấn")}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base ml-2">
              Tư vấn
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Additional info */}
      <View className="mt-8 px-6">
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-700 text-sm ml-2 flex-1">
              Shop sẽ phản hồi trong vòng vài phút. Bạn có thể gửi tin nhắn bất
              cứ lúc nào!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Handle quick message selection
  const handleQuickMessage = (message: string) => {
    setMessageText(message);
    // Auto-send after a short delay
    setTimeout(() => {
      handleSendMessage();
    }, 500);
  };

  // Render typing indicator with beautiful design
  const renderTypingIndicator = () => (
    <View className="flex-row items-center p-4 bg-white rounded-2xl mx-4 mb-4 shadow-sm border border-gray-100">
      {/* Avatar */}
      <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-3">
        <Text className="text-primary-600 font-semibold text-sm">S</Text>
      </View>

      {/* Typing animation */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse" />
          <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse" />
          <View className="w-2 h-2 bg-gray-400 rounded-full" />
        </View>
        <Text className="text-sm text-gray-500">
          Shop đang nhập tin nhắn...
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center px-6">
          {/* Beautiful loading animation */}
          <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 items-center justify-center mb-6 shadow-lg">
            <ActivityIndicator size="large" color="#E05C78" />
          </View>

          <Text className="text-xl font-semibold text-gray-800 mb-3 text-center">
            Đang tải tin nhắn...
          </Text>

          <Text className="text-base text-gray-600 text-center leading-6">
            Vui lòng chờ trong giây lát
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center px-6">
          <View className="items-center">
            {/* Beautiful error icon */}
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-red-100 items-center justify-center mb-6 shadow-lg">
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </View>

            <Text className="text-xl font-semibold text-gray-800 mb-3 text-center">
              Có lỗi xảy ra
            </Text>

            <Text className="text-base text-gray-600 text-center mb-8 leading-6">
              {error}
            </Text>

            {/* Action buttons with modern design */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 rounded-2xl shadow-lg"
                onPress={handleRetry}
                disabled={retrying}
                activeOpacity={0.8}
              >
                {retrying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Thử lại
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-4 rounded-2xl shadow-lg"
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-base">
                  Quay lại
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!chatRoom || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center px-6">
          {/* Beautiful not found icon */}
          <View className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center mb-6 shadow-lg">
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
          </View>

          <Text className="text-xl font-semibold text-gray-800 mb-3 text-center">
            Không tìm thấy cuộc trò chuyện
          </Text>

          <TouchableOpacity
            className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 rounded-2xl shadow-lg mt-4"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {renderHeader()}

        {/* Messages list with improved configuration */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexGrow: messages.length === 0 ? 1 : 0,
          }}
          showsVerticalScrollIndicator={false}
          inverted={messages.length > 0}
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }}
          onLayout={() => {
            if (flatListRef.current && messages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }
          }}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            messages.length === 0 ? renderTypingIndicator : null
          }
          ListFooterComponent={() => <View className="h-4" />}
          removeClippedSubviews={false}
          maxToRenderPerBatch={50}
          windowSize={20}
        />

        {renderInput()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
