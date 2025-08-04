import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import ChatList from "../../components/chat/ChatList";
import { useTokenCheck } from "../../hooks/useTokenCheck";

export default function Chat() {
  useTokenCheck();

  // Mock user data - in real app, get from auth context
  const currentUser = {
    id: "user123",
    type: "customer" as const,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ChatList userId={currentUser.id} userType={currentUser.type} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
