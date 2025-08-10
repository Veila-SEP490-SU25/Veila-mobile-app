import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import NotificationList from "../../components/notifications/NotificationList";

export default function Notifications() {
  const currentUser = {
    id: "user123",
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NotificationList userId={currentUser.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
