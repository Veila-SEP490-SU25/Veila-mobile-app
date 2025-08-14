import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: "default" | "outlined" | "filled";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  required?: boolean;
  containerStyle?: any;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = "default",
      size = "medium",
      disabled = false,
      required = false,
      containerStyle,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "outlined":
          return {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: error ? "#EF4444" : isFocused ? "#E05C78" : "#D1D5DB",
          };
        case "filled":
          return {
            backgroundColor: disabled ? "#F3F4F6" : "#F9FAFB",
            borderWidth: 1,
            borderColor: error
              ? "#EF4444"
              : isFocused
                ? "#E05C78"
                : "transparent",
          };
        default:
          return {
            backgroundColor: disabled ? "#F3F4F6" : "#FFFFFF",
            borderWidth: 1,
            borderColor: error ? "#EF4444" : isFocused ? "#E05C78" : "#E5E7EB",
          };
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "small":
          return {
            paddingVertical: 8,
            paddingHorizontal: 12,
            fontSize: 14,
            minHeight: 36,
          };
        case "large":
          return {
            paddingVertical: 16,
            paddingHorizontal: 20,
            fontSize: 18,
            minHeight: 56,
          };
        default:
          return {
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            minHeight: 48,
          };
      }
    };

    const getIconSize = () => {
      switch (size) {
        case "small":
          return 16;
        case "large":
          return 20;
        default:
          return 18;
      }
    };

    const renderLeftIcon = () => {
      if (!leftIcon) return null;

      return (
        <View style={styles.leftIconContainer}>
          <Ionicons
            name={leftIcon}
            size={getIconSize()}
            color={disabled ? "#9CA3AF" : "#6B7280"}
          />
        </View>
      );
    };

    const renderRightIcon = () => {
      if (!rightIcon && props.secureTextEntry === undefined) return null;

      const iconName = props.secureTextEntry
        ? isPasswordVisible
          ? "eye-off"
          : "eye"
        : rightIcon;

      if (!iconName) return null;

      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={
            props.secureTextEntry ? togglePasswordVisibility : onRightIconPress
          }
          disabled={disabled}
        >
          <Ionicons
            name={iconName}
            size={getIconSize()}
            color={disabled ? "#9CA3AF" : "#6B7280"}
          />
        </TouchableOpacity>
      );
    };

    const inputProps = {
      ...props,
      secureTextEntry: props.secureTextEntry ? !isPasswordVisible : false,
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, disabled && styles.labelDisabled]}>
              {label}
            </Text>
            {required && <Text style={styles.required}>*</Text>}
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            getVariantStyles(),
            isFocused && styles.focused,
            disabled && styles.disabled,
            error && styles.error,
          ]}
        >
          {renderLeftIcon()}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              getSizeStyles(),
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || props.secureTextEntry) && styles.inputWithRightIcon,
              disabled && styles.inputDisabled,
              style,
            ]}
            placeholderTextColor="#9CA3AF"
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            {...inputProps}
          />

          {renderRightIcon()}
        </View>

        {(error || helperText) && (
          <View style={styles.helperContainer}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.helperText}>{helperText}</Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

// Specialized input components for common use cases
export const TextInputField = (props: Omit<InputProps, "variant">) => (
  <Input variant="default" {...props} />
);

export const OutlinedInput = (props: Omit<InputProps, "variant">) => (
  <Input variant="outlined" {...props} />
);

export const FilledInput = (props: Omit<InputProps, "variant">) => (
  <Input variant="filled" {...props} />
);

export const PasswordInput = (props: Omit<InputProps, "secureTextEntry">) => (
  <Input secureTextEntry {...props} />
);

export const SearchInput = (props: Omit<InputProps, "leftIcon">) => (
  <Input leftIcon="search" {...props} />
);

export const EmailInput = (
  props: Omit<InputProps, "leftIcon" | "keyboardType">
) => (
  <Input
    leftIcon="mail"
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    {...props}
  />
);

export const PhoneInput = (
  props: Omit<InputProps, "leftIcon" | "keyboardType">
) => <Input leftIcon="call" keyboardType="phone-pad" {...props} />;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  labelDisabled: {
    color: "#9CA3AF",
  },
  required: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    color: "#111827",
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  inputDisabled: {
    color: "#9CA3AF",
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  focused: {
    borderColor: "#E05C78",
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },
  error: {
    borderColor: "#EF4444",
  },
  helperContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
  },
});

export default Input;
