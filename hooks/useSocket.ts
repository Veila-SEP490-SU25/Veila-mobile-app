import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../providers/auth.provider";
import { IConversation, IMessage } from "../services/types";
import { getTokens } from "../utils";
const socketIo: any = require("socket.io-client");

export interface ISendMessagePayload {
  content: string;
  imageUrl?: string;
  fileUrl?: string;
  type?: "text" | "image" | "file";
}

function getSocketUrl(): string | null {
  const url =
    process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL;
  if (!url) return null;
  return url.replace(/\/$/, "");
}

export const useSocket = () => {
  const socketUrl = getSocketUrl();
  const { user } = useAuth();

  const socketRef = useRef<any | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>("");

  const currentRoomIdRef = useRef<string>("");
  useEffect(() => {
    currentRoomIdRef.current = currentRoomId;
  }, [currentRoomId]);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      const tokens = await getTokens();
      const token = tokens?.accessToken;

      if (!socketUrl || !token) {
        if (socketRef.current) {
          socketRef.current.removeAllListeners?.();
          socketRef.current.disconnect?.();
          socketRef.current = null;
        }
        return;
      }

      if (socketRef.current) {
        socketRef.current.removeAllListeners?.();
        socketRef.current.disconnect?.();
      }

      const newSocket: any = socketIo.io
        ? socketIo.io(socketUrl, {
            transports: ["websocket"],
            auth: { token },
            extraHeaders: { authorization: token },
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          })
        : socketIo(socketUrl, {
            transports: ["websocket"],
            auth: { token },
            extraHeaders: { authorization: token },
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });

      if (!isMounted) return;
      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("Socket connected");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        try {
          newSocket.emit("getConversations");
          console.log("Requested conversations");
        } catch (error) {
          console.error("Error requesting conversations:", error);
        }
      });

      newSocket.on("disconnect", (reason: any) => {
        if (reason === "io server disconnect") {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              socketRef.current.connect();
            }
          }, 2000);
        }
      });

      newSocket.on("connect_error", () => {});
      newSocket.on("exception", () => {});

      // Message handling with duplicate prevention (like web version)
      newSocket.on("message", (message: IMessage) => {
        console.log("Received message:", message);
        setMessages((prevMessages) => {
          // Check for duplicate messages based on content, sender, and timestamp
          const isDuplicate = prevMessages.some(
            (existingMessage) =>
              existingMessage.senderId === message.senderId &&
              existingMessage.content === message.content &&
              Math.abs(
                new Date(existingMessage.createdAt).getTime() -
                  new Date(message.createdAt).getTime()
              ) < 1000 // Within 1 second
          );

          if (isDuplicate) {
            console.log("Duplicate message, skipping");
            return prevMessages;
          }

          // Add room info to message
          const messageWithRoom = {
            ...message,
            chatRoomId: currentRoomIdRef.current,
            conversationId: currentRoomIdRef.current,
          };

          // Add new message and sort by timestamp
          const updatedMessages = [...prevMessages, messageWithRoom];
          return updatedMessages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      });

      // Conversation handling with better state updates (like web version)
      newSocket.on("conversation", (conversation: IConversation) => {
        console.log("Received conversation:", conversation);
        setConversations((prevConversations) => {
          // Remove existing conversation with same ID to prevent duplicates
          const filteredConversations = prevConversations.filter(
            (c) => c.conversationId !== conversation.conversationId
          );

          // Add updated conversation and sort by last message timestamp
          const updatedConversations = [...filteredConversations, conversation];
          return updatedConversations.sort((a, b) => {
            const dateA = a.lastMessage
              ? new Date(a.lastMessage.createdAt).getTime()
              : 0;
            const dateB = b.lastMessage
              ? new Date(b.lastMessage.createdAt).getTime()
              : 0;
            return dateB - dateA;
          });
        });
      });

      // Conversations handling (like web version)
      newSocket.on("conversations", (list: IConversation[]) => {
        console.log("Received conversations:", list?.length || 0);
        setConversations(list || []);
      });
    };

    setup();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners?.();
          socketRef.current.disconnect?.();
        } catch {}
        socketRef.current = null;
      }
    };
  }, [socketUrl]);

  // Enhanced changeRoom with better state management (like web version)
  const changeRoom = useCallback((roomId: string) => {
    if (roomId === currentRoomIdRef.current) return;
    if (!socketRef.current || !socketRef.current.connected) return;

    console.log("Changing room to:", roomId);
    // Clear current messages immediately for better UX
    setMessages([]);
    setCurrentRoomId(roomId);

    // Request messages for new room
    socketRef.current.emit("getMessage", { conversationId: roomId });
    console.log("Emitted getMessage for:", roomId);
  }, []);

  // Enhanced sendMessage with validation (like web version)
  const sendMessage = useCallback((payload: ISendMessagePayload) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Socket not connected, cannot send message");
      return;
    }

    if (!currentRoomIdRef.current) {
      console.warn("No current room selected, cannot send message");
      return;
    }

    if (!payload.content?.trim() && !payload.imageUrl && !payload.fileUrl) {
      console.warn("Message content is empty, cannot send message");
      return;
    }

    console.log(
      "Sending message:",
      payload,
      "to room:",
      currentRoomIdRef.current
    );
    socketRef.current.emit("sendMessage", {
      ...payload,
      chatRoomId: currentRoomIdRef.current,
    });
  }, []);

  // Enhanced createConversation that waits for conversation creation
  const createConversation = useCallback(
    (receiverId: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        console.log("createConversation called with receiverId:", receiverId);
        console.log("Socket connected:", socketRef.current?.connected);
        console.log("User authenticated:", !!user);

        if (!socketRef.current || !socketRef.current.connected) {
          console.warn("Socket not connected, cannot create conversation");
          reject(new Error("Socket not connected"));
          return;
        }

        if (!user) {
          console.warn("User not authenticated, cannot create conversation");
          reject(new Error("User not authenticated"));
          return;
        }

        if (receiverId === user.id) {
          console.warn("Cannot create conversation with self");
          reject(new Error("Cannot create conversation with self"));
          return;
        }

        const timeout = setTimeout(() => {
          console.warn("Timeout creating conversation");
          cleanup();
          reject(new Error("Timeout creating conversation"));
        }, 10000);

        const handleConversation = (conversation: IConversation) => {
          console.log("Received conversation:", conversation);
          // Check if this conversation is for the receiver we're creating with
          if (conversation.receiverId === receiverId) {
            console.log(
              "Conversation matched, resolving with ID:",
              conversation.conversationId
            );
            cleanup();
            resolve(conversation.conversationId);
          }
        };

        const handleError = (error: any) => {
          console.error("Socket error in createConversation:", error);
          cleanup();
          reject(
            new Error("Socket error: " + (error.message || "Unknown error"))
          );
        };

        const cleanup = () => {
          clearTimeout(timeout);
          try {
            socketRef.current?.off("conversation", handleConversation);
            socketRef.current?.off("error", handleError);
          } catch (e) {
            console.warn("Error during cleanup:", e);
          }
        };

        socketRef.current.on("conversation", handleConversation);
        socketRef.current.on("error", handleError);

        console.log("Emitting createConversation with:", {
          user1Id: user.id,
          user2Id: receiverId,
        });

        socketRef.current.emit("createConversation", {
          user1Id: user.id,
          user2Id: receiverId,
        });
      });
    },
    [user]
  );

  return {
    messages,
    conversations,
    sendMessage,
    changeRoom,
    createConversation,
    currentRoomId: currentRoomIdRef.current,
  };
};
