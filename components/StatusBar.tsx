import React from "react";
import { StatusBar as RNStatusBar, StatusBarStyle, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StatusBarProps {
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  translucent?: boolean;
  showBackground?: boolean;
  height?: number;
}

export default function StatusBar({
  barStyle = "dark-content",
  backgroundColor = "#FFFFFF",
  translucent = false,
  showBackground = false,
  height,
}: StatusBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <RNStatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={translucent}
      />
      {showBackground && (
        <View
          style={{
            height: height || insets.top,
            backgroundColor,
            width: "100%",
          }}
        />
      )}
    </>
  );
}

export const LightStatusBar = () => (
  <StatusBar barStyle="light-content" backgroundColor="#E05C78" />
);

export const DarkStatusBar = () => (
  <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
);

export const TransparentStatusBar = () => (
  <StatusBar
    barStyle="light-content"
    translucent
    backgroundColor="transparent"
  />
);

export const GradientStatusBar = () => (
  <StatusBar barStyle="light-content" backgroundColor="#C04060" />
);
