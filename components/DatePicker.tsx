import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  title?: string;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
  initialDate?: Date;
}

export default function DatePicker({
  visible,
  onClose,
  onConfirm,
  title = "Chọn ngày",
  mode = "date",
  minimumDate,
  maximumDate,
  initialDate = new Date(),
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const handleCancel = () => {
    setSelectedDate(initialDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.headerButton}
            >
              <Text style={[styles.headerButtonText, styles.confirmText]}>
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={styles.picker}
            />
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={20} color="#E05C78" />
            <Text style={styles.selectedDateText}>
              {formatDate(selectedDate)}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              Chọn ngày phù hợp với lịch trình của bạn
            </Text>
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
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  confirmText: {
    color: "#E05C78",
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  pickerContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  picker: {
    width: 300,
    height: 200,
  },
  selectedDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#FEF3F2",
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#991B1B",
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
});
