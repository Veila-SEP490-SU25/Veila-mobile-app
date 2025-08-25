import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ChatService } from "../../services/chat.service";
import { db } from "../../services/firebase";

export default function FirebaseTestComponent() {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Checking...");
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  const checkFirebaseConnection = async () => {
    const results: string[] = [];

    try {
      // Test 1: Check if Firebase is initialized
      if (db) {
        results.push("✅ Firebase Firestore initialized");
        setConnectionStatus("Connected");
      } else {
        results.push("❌ Firebase Firestore not initialized");
        setConnectionStatus("Not Connected");
      }

      // Test 2: Check connection
      const isConnected = await ChatService.ensureConnection();
      if (isConnected) {
        results.push("✅ Firebase connection successful");
      } else {
        results.push(
          "⚠️ Firebase connection failed (but might work in mock mode)"
        );
      }

      setTestResults(results);
    } catch (error) {
      results.push(`❌ Error: ${error}`);
      setTestResults(results);
      setConnectionStatus("Error");
    }
  };

  const testCreateChatRoom = async () => {
    try {
      const chatRoomData = {
        customerId: "test-customer-123",
        customerName: "Test Customer",
        customerAvatar: undefined,
        shopId: "test-shop-456",
        shopName: "Test Shop",
        shopAvatar: undefined,
        unreadCount: 0,
        isActive: true,
      };

      const roomId = await ChatService.createChatRoom(chatRoomData);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Chat room created: ${roomId}`,
      });

      setTestResults((prev) => [...prev, `✅ Chat room created: ${roomId}`]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to create chat room: ${error}`,
      });

      setTestResults((prev) => [
        ...prev,
        `❌ Failed to create chat room: ${error}`,
      ]);
    }
  };

  const testSendMessage = async () => {
    try {
      // First create a room
      const chatRoomData = {
        customerId: "test-customer-123",
        customerName: "Test Customer",
        customerAvatar: undefined,
        shopId: "test-shop-456",
        shopName: "Test Shop",
        shopAvatar: undefined,
        unreadCount: 0,
        isActive: true,
      };

      const roomId = await ChatService.createChatRoom(chatRoomData);

      // Then send a message
      const messageId = await ChatService.sendMessage(
        {
          chatRoomId: roomId,
          content: "Hello! This is a test message.",
          type: "text",
        },
        {
          senderId: "test-customer-123",
          senderName: "Test Customer",
          senderAvatar: undefined,
        }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Message sent: ${messageId}`,
      });

      setTestResults((prev) => [...prev, `✅ Message sent: ${messageId}`]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to send message: ${error}`,
      });

      setTestResults((prev) => [
        ...prev,
        `❌ Failed to send message: ${error}`,
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Chat Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Connection Status:</Text>
        <Text
          style={[
            styles.statusText,
            { color: connectionStatus === "Connected" ? "#10B981" : "#EF4444" },
          ]}
        >
          {connectionStatus}
        </Text>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={checkFirebaseConnection}
        >
          <Text style={styles.buttonText}>Recheck Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testCreateChatRoom}>
          <Text style={styles.buttonText}>Test Create Chat Room</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSendMessage}>
          <Text style={styles.buttonText}>Test Send Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={() => setTestResults([])}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    backgroundColor: "#E05C78",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#6B7280",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
