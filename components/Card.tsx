import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "filled";
  padding?: "none" | "small" | "medium" | "large";
  margin?: "none" | "small" | "medium" | "large";
  borderRadius?: "none" | "small" | "medium" | "large" | "full";
  shadow?: "none" | "small" | "medium" | "large";
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
}

export default function Card({
  children,
  variant = "default",
  padding = "medium",
  margin = "none",
  borderRadius = "medium",
  shadow = "small",
  onPress,
  disabled = false,
  activeOpacity = 0.8,
  style,
  ...props
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: "#FFFFFF",
          borderWidth: 0,
        };
      case "outlined":
        return {
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
        };
      case "filled":
        return {
          backgroundColor: "#F9FAFB",
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: "#FFFFFF",
          borderWidth: 0,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case "none":
        return { padding: 0 };
      case "small":
        return { padding: 12 };
      case "large":
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  const getMarginStyles = () => {
    switch (margin) {
      case "none":
        return { margin: 0 };
      case "small":
        return { margin: 8 };
      case "large":
        return { margin: 24 };
      default:
        return { margin: 16 };
    }
  };

  const getBorderRadiusStyles = () => {
    switch (borderRadius) {
      case "none":
        return { borderRadius: 0 };
      case "small":
        return { borderRadius: 8 };
      case "large":
        return { borderRadius: 16 };
      case "full":
        return { borderRadius: 9999 };
      default:
        return { borderRadius: 12 };
    }
  };

  const getShadowStyles = () => {
    switch (shadow) {
      case "none":
        return {};
      case "small":
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
      case "medium":
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case "large":
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        };
      default:
        return {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
    }
  };

  const cardStyles = [
    styles.card,
    getVariantStyles(),
    getPaddingStyles(),
    getMarginStyles(),
    getBorderRadiusStyles(),
    getShadowStyles(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

export const ProductCard = ({
  children,
  onPress,
  ...props
}: Omit<CardProps, "variant" | "shadow" | "borderRadius">) => (
  <Card
    variant="elevated"
    shadow="medium"
    borderRadius="large"
    onPress={onPress}
    {...props}
  >
    {children}
  </Card>
);

export const InfoCard = ({
  children,
  ...props
}: Omit<CardProps, "variant" | "shadow" | "borderRadius">) => (
  <Card variant="outlined" shadow="none" borderRadius="medium" {...props}>
    {children}
  </Card>
);

export const ActionCard = ({
  children,
  onPress,
  ...props
}: Omit<CardProps, "variant" | "shadow" | "borderRadius">) => (
  <Card
    variant="filled"
    shadow="small"
    borderRadius="medium"
    onPress={onPress}
    {...props}
  >
    {children}
  </Card>
);

export const ProfileCard = ({
  children,
  ...props
}: Omit<CardProps, "variant" | "shadow" | "borderRadius">) => (
  <Card variant="elevated" shadow="large" borderRadius="full" {...props}>
    {children}
  </Card>
);

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
});
