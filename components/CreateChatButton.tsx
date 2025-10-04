import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../providers/auth.provider";
import { showMessage } from "../utils/message.util";

interface CreateChatButtonProps {
  receiverId: string;
  trigger?: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  className?: string;
}

export function CreateChatButton({
  receiverId,
  trigger,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
}: CreateChatButtonProps) {
  const { createConversation } = useSocket();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateChat = useCallback(async () => {
    if (!user) {
      showMessage("SSM001", "Vui lòng đăng nhập để sử dụng tính năng chat");
      return;
    }

    if (!receiverId) {
      showMessage("ERM006", "Không tìm thấy thông tin người nhận");
      return;
    }

    try {
      setIsLoading(true);
      const conversationId = await createConversation(receiverId);
      console.log("Conversation created successfully:", conversationId);
      router.push(`/chat/${conversationId}`);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      showMessage("ERM006", "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [createConversation, receiverId, user, router]);

  const getButtonStyles = () => {
    const baseStyles = "rounded-xl items-center justify-center";
    const sizeStyles = {
      small: "px-3 py-2",
      medium: "px-4 py-3",
      large: "px-6 py-4",
    };
    const variantStyles = {
      primary: "bg-primary-500",
      outline: "bg-transparent border border-primary-500",
      ghost: "bg-transparent",
    };
    const widthStyles = fullWidth ? "w-full" : "";

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`;
  };

  const getTextStyles = () => {
    const sizeStyles = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    };
    const variantStyles = {
      primary: "text-white font-semibold",
      outline: "text-primary-500 font-semibold",
      ghost: "text-primary-500 font-medium",
    };

    return `${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  if (trigger) {
    return (
      <TouchableOpacity onPress={handleCreateChat} disabled={isLoading}>
        {trigger}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleCreateChat}
      disabled={isLoading}
      className={getButtonStyles()}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#FFFFFF" : "#E05C78"}
          />
        ) : (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={size === "small" ? 16 : size === "large" ? 20 : 18}
            color={variant === "primary" ? "#FFFFFF" : "#E05C78"}
          />
        )}
        <Text className={`${getTextStyles()} ml-2`}>
          {isLoading ? "Đang tạo..." : "Nhắn tin"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
