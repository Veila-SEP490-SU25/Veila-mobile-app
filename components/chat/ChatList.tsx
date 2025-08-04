import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChatService } from "../../services/chat.service";
import { ChatRoom } from "../../services/types";

interface ChatListProps {
  userId: string;
  userType: "customer" | "shop";
}

export default function ChatList({ userId, userType }: ChatListProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToChatRooms(
      userId,
      userType,
      (rooms) => {
        setChatRooms(rooms);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, userType]);

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const otherPartyName =
      userType === "customer" ? item.shopName : item.customerName;
    const otherPartyAvatar =
      userType === "customer" ? item.shopAvatar : item.customerAvatar;
    const lastMessage = item.lastMessage;
    const unreadCount = item.unreadCount;

    return (
      <TouchableOpacity
        style={styles.chatRoomItem}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatarContainer}>
          {otherPartyAvatar ? (
            <Image source={{ uri: otherPartyAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {otherPartyName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {otherPartyName}
            </Text>
            {lastMessage && (
              <Text style={styles.time}>
                {formatDistanceToNow(lastMessage.timestamp, {
                  addSuffix: true,
                  locale: vi,
                })}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            {lastMessage ? (
              <>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {lastMessage.senderName}: {lastMessage.content}
                </Text>
                {unreadCount > 0 && <View style={styles.unreadIndicator} />}
              </>
            ) : (
              <Text style={styles.noMessage}>Chưa có tin nhắn nào</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
        <Text style={styles.emptySubtext}>
          Bắt đầu trò chuyện với shop để được hỗ trợ
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chatRooms}
      renderItem={renderChatRoom}
      keyExtractor={(item) => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  chatRoomItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#666666",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  noMessage: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
});
