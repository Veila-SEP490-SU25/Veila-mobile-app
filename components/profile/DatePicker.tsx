import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
}: DatePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  React.useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-").map(Number);
      if (year && month && day) {
        setSelectedYear(year);
        setSelectedMonth(month);
        setSelectedDay(day);
      }
    }
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
    onChange(formattedDate);
    setShowModal(false);
  };

  const getDisplayText = () => {
    if (!value) return "Chọn ngày sinh";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const renderPickerColumn = (
    data: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    label: string
  ) => (
    <View style={styles.pickerColumn}>
      <Text style={styles.columnLabel}>{label}</Text>
      <ScrollView
        style={styles.pickerScroll}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.pickerItem,
              selectedValue === item && styles.selectedPickerItem,
            ]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                styles.pickerItemText,
                selectedValue === item && styles.selectedPickerItemText,
              ]}
            >
              {item.toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerText, !value && styles.placeholderText]}>
            {getDisplayText()}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#999999" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {renderPickerColumn(years, selectedYear, setSelectedYear, "Năm")}
              {renderPickerColumn(
                months,
                selectedMonth,
                setSelectedMonth,
                "Tháng"
              )}
              {renderPickerColumn(days, selectedDay, setSelectedDay, "Ngày")}
            </View>

            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>
                Ngày sinh: {selectedDay.toString().padStart(2, "0")}/
                {selectedMonth.toString().padStart(2, "0")}/{selectedYear}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  pickerText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "#999999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#E05C78",
    fontWeight: "600",
  },
  pickerContainer: {
    flexDirection: "row",
    paddingVertical: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  columnLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  pickerScroll: {
    height: 200,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  selectedPickerItem: {
    backgroundColor: "#E05C78",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#333333",
  },
  selectedPickerItemText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  selectedDateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E05C78",
  },
});
