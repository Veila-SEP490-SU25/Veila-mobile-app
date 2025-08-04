import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationPopupProps {
  visible: boolean;
  errors: ValidationError[];
  onClose: () => void;
  onContinue: () => void;
}

export default function ValidationPopup({
  visible,
  errors,
  onClose,
  onContinue,
}: ValidationPopupProps) {
  const getFieldIcon = (field: string) => {
    switch (field.toLowerCase()) {
      case "address":
        return "location-outline";
      case "birthdate":
      case "birth":
        return "calendar-outline";
      case "name":
      case "firstname":
      case "lastname":
        return "person-outline";
      default:
        return "alert-circle-outline";
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field.toLowerCase()) {
      case "address":
        return "Địa chỉ";
      case "birthdate":
      case "birth":
        return "Ngày sinh";
      case "firstname":
        return "Họ";
      case "lastname":
        return "Tên";
      case "name":
        return "Họ và tên";
      default:
        return field;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.title}>Thông tin chưa đầy đủ</Text>
            <Text style={styles.subtitle}>
              Vui lòng bổ sung các thông tin sau để hoàn tất hồ sơ:
            </Text>
          </View>

          <ScrollView
            style={styles.errorList}
            showsVerticalScrollIndicator={false}
          >
            {errors.map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <View style={styles.errorIcon}>
                  <Ionicons
                    name={getFieldIcon(error.field) as any}
                    size={20}
                    color="#EF4444"
                  />
                </View>
                <View style={styles.errorContent}>
                  <Text style={styles.errorField}>
                    {getFieldLabel(error.field)}
                  </Text>
                  <Text style={styles.errorMessage}>{error.message}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Để sau</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.continueButtonText}>Bổ sung ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  popup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: "100%",
    maxHeight: "80%",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  errorList: {
    maxHeight: 200,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorField: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  errorMessage: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E05C78",
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
