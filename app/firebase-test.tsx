import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import FirebaseTestComponent from "../components/chat/FirebaseTestComponent";

export default function FirebaseTestScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      <FirebaseTestComponent />
    </SafeAreaView>
  );
}
