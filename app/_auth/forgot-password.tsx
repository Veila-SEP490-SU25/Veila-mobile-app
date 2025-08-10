import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import ForgotPasswordForm from "../../components/auth/login/forgot-password-form";

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ForgotPasswordForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
