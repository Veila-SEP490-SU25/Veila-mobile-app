import React from "react";
import { Dimensions } from "react-native";
import { BaseToast, ErrorToast } from "react-native-toast-message";

const { width } = Dimensions.get("window");

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#10B981",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 0,
        minHeight: 56,
        width: width - 80, // Thu hẹp 2 bên
        marginHorizontal: 40, // Tăng margin
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1.5, // Tăng độ dày viền
        borderColor: "#E5E7EB", // Viền xám nhạt
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#065F46",
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 12,
        color: "#047857",
        lineHeight: 16,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 0,
        minHeight: 56,
        width: width - 80, // Thu hẹp 2 bên
        marginHorizontal: 40, // Tăng margin
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1.5, // Tăng độ dày viền
        borderColor: "#E5E7EB", // Viền xám nhạt
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#991B1B",
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 12,
        color: "#B91C1C",
        lineHeight: 16,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#3B82F6",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 0,
        minHeight: 56,
        width: width - 80, // Thu hẹp 2 bên
        marginHorizontal: 40, // Tăng margin
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1.5, // Tăng độ dày viền
        borderColor: "#E5E7EB", // Viền xám nhạt
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#1E40AF",
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 12,
        color: "#2563EB",
        lineHeight: 16,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#F59E0B",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderLeftWidth: 0,
        minHeight: 56,
        width: width - 80, // Thu hẹp 2 bên
        marginHorizontal: 40, // Tăng margin
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1.5, // Tăng độ dày viền
        borderColor: "#E5E7EB", // Viền xám nhạt
      }}
      text1Style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#92400E",
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 12,
        color: "#B45309",
        lineHeight: 16,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    />
  ),
};
