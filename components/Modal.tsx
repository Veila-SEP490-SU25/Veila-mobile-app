import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal as RNModal,
  ModalProps as RNModalProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ModalProps extends Omit<RNModalProps, "animationType"> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  size?: "small" | "medium" | "large" | "full";
  variant?: "default" | "centered" | "bottom" | "top";
  showBackdrop?: boolean;
  backdropOpacity?: number;
  closeOnBackdropPress?: boolean;
  headerStyle?: any;
  contentStyle?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function Modal({
  children,
  title,
  subtitle,
  showCloseButton = true,
  onClose,
  size = "medium",
  variant = "centered",
  showBackdrop = true,
  backdropOpacity = 0.5,
  closeOnBackdropPress = true,
  headerStyle,
  contentStyle,
  visible,
  onRequestClose,
  ...props
}: ModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          width: screenWidth * 0.8,
          maxWidth: 400,
        };
      case "large":
        return {
          width: screenWidth * 0.9,
          maxWidth: 600,
        };
      case "full":
        return {
          width: screenWidth,
          height: screenHeight,
        };
      default:
        return {
          width: screenWidth * 0.85,
          maxWidth: 500,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "bottom":
        return {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case "top":
        return {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        };
      default:
        return {
          borderRadius: 20,
        };
    }
  };

  const getSlideTransform = () => {
    switch (variant) {
      case "bottom":
        return {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            },
          ],
        };
      case "top":
        return {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0],
              }),
            },
          ],
        };
      default:
        return {
          transform: [
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
    }
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress && onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleRequestClose = () => {
    if (onRequestClose) {
      onRequestClose();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleRequestClose}
      {...props}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        {showBackdrop && (
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backdropTouchable}
              onPress={handleBackdropPress}
              activeOpacity={1}
            />
          </Animated.View>
        )}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            getSizeStyles(),
            getVariantStyles(),
            getSlideTransform(),
            contentStyle,
          ]}
        >
          {/* Header */}
          {(title || subtitle || showCloseButton) && (
            <View style={[styles.header, headerStyle]}>
              <View style={styles.headerContent}>
                {title && (
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && (
                      <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                  </View>
                )}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

export const ConfirmModal = ({
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  variant = "default",
  ...props
}: Omit<ModalProps, "children"> & {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger" | "warning";
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case "danger":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      default:
        return "#E05C78";
    }
  };

  return (
    <Modal
      title={title}
      size="small"
      showCloseButton={false}
      closeOnBackdropPress={false}
      {...props}
    >
      <View style={styles.confirmContent}>
        <Text style={styles.confirmMessage}>{message}</Text>

        <View style={styles.confirmButtons}>
          <TouchableOpacity
            style={[styles.confirmButton, { borderColor: "#D1D5DB" }]}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.confirmButtonText, { color: "#6B7280" }]}>
              {cancelText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: getVariantColor() },
            ]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.confirmButtonText, { color: "#FFFFFF" }]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const ActionSheet = ({
  title,
  actions,
  onCancel,
  ...props
}: Omit<ModalProps, "children" | "variant" | "size"> & {
  title?: string;
  actions: Array<{
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: "default" | "danger";
    onPress: () => void;
  }>;
  onCancel?: () => void;
}) => {
  return (
    <Modal
      title={title}
      variant="bottom"
      size="full"
      showCloseButton={false}
      {...props}
    >
      <View style={styles.actionSheetContent}>
        {actions.map((action, index) => {
          const isDanger = action.variant === "danger";

          return (
            <TouchableOpacity
              key={index}
              style={[styles.actionItem, isDanger && styles.actionItemDanger]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              {action.icon && (
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={isDanger ? "#EF4444" : "#374151"}
                  style={styles.actionIcon}
                />
              )}
              <Text
                style={[styles.actionText, isDanger && styles.actionTextDanger]}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          );
        })}

        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },

  confirmContent: {
    alignItems: "center",
  },
  confirmMessage: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  actionSheetContent: {
    paddingBottom: 34,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  actionItemDanger: {
    borderBottomColor: "#FEE2E2",
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  actionTextDanger: {
    color: "#EF4444",
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderTopWidth: 8,
    borderTopColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
});
