import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  rounded?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  rounded = false,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: isDisabled ? "#D1D5DB" : "#E05C78",
          borderColor: isDisabled ? "#D1D5DB" : "#E05C78",
        };
      case "secondary":
        return {
          backgroundColor: isDisabled ? "#F3F4F6" : "#6B7280",
          borderColor: isDisabled ? "#F3F4F6" : "#6B7280",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: isDisabled ? "#D1D5DB" : "#E05C78",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
        };
      case "danger":
        return {
          backgroundColor: isDisabled ? "#FCA5A5" : "#EF4444",
          borderColor: isDisabled ? "#FCA5A5" : "#EF4444",
        };
      default:
        return {
          backgroundColor: isDisabled ? "#D1D5DB" : "#E05C78",
          borderColor: isDisabled ? "#D1D5DB" : "#E05C78",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: rounded ? 20 : 8,
        };
      case "large":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: rounded ? 28 : 12,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: rounded ? 24 : 10,
        };
    }
  };

  const getTextColor = () => {
    if (isDisabled) return "#9CA3AF";

    switch (variant) {
      case "outline":
        return "#E05C78";
      case "ghost":
        return "#E05C78";
      default:
        return "#FFFFFF";
    }
  };

  const getIconColor = () => {
    if (isDisabled) return "#9CA3AF";

    switch (variant) {
      case "outline":
        return "#E05C78";
      case "ghost":
        return "#E05C78";
      default:
        return "#FFFFFF";
    }
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconSize = size === "small" ? 16 : size === "large" ? 20 : 18;
    const iconColor = getIconColor();

    return (
      <Ionicons
        name={icon}
        size={iconSize}
        color={iconColor}
        style={
          iconPosition === "right" ? { marginLeft: 8 } : { marginRight: 8 }
        }
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={styles.loadingSpinner}
          />
          <Text style={[styles.title, { color: getTextColor() }]}>
            Đang xử lý...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === "left" && renderIcon()}
        <Text style={[styles.title, { color: getTextColor() }]}>{title}</Text>
        {icon && iconPosition === "right" && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

export const PrimaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="outline" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="ghost" {...props} />
);

export const DangerButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="danger" {...props} />
);

const getIconButtonStyle = (size: string, variant: string) => {
  const sizeKey =
    `iconButton${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles;
  const variantKey =
    `iconButton${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;

  return [styles.iconButton, styles[sizeKey], styles[variantKey]];
};

export const IconButton = ({
  icon,
  size = "medium",
  variant = "primary",
  onPress,
  disabled = false,
  style,
  ...props
}: Omit<ButtonProps, "title">) => {
  const iconSize = size === "small" ? 20 : size === "large" ? 28 : 24;

  return (
    <TouchableOpacity
      style={[
        ...getIconButtonStyle(size, variant),
        disabled && styles.iconButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Ionicons
        name={icon!}
        size={iconSize}
        color={disabled ? "#9CA3AF" : "#FFFFFF"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 44,
  },
  fullWidth: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    marginRight: 8,
  },

  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
  },
  iconButtonMedium: {
    width: 44,
    height: 44,
  },
  iconButtonLarge: {
    width: 56,
    height: 56,
  },
  iconButtonPrimary: {
    backgroundColor: "#E05C78",
  },
  iconButtonSecondary: {
    backgroundColor: "#6B7280",
  },
  iconButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E05C78",
  },
  iconButtonGhost: {
    backgroundColor: "transparent",
  },
  iconButtonDanger: {
    backgroundColor: "#EF4444",
  },
  iconButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
});
