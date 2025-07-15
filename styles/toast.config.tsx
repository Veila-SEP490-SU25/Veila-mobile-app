import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e",
        borderRadius: 12,
        backgroundColor: "#f0fdf4",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#15803d",
      }}
      text2Style={{
        fontSize: 14,
        color: "#166534",
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#dc2626",
        borderRadius: 12,
        backgroundColor: "#fef2f2",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "bold",
        color: "#991b1b",
      }}
      text2Style={{
        fontSize: 14,
        color: "#b91c1c",
      }}
    />
  ),
};
