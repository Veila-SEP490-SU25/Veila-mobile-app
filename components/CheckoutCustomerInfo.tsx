import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Input from "./Input";

type CheckoutCustomerInfoProps = {
  orderData: {
    phone: string;
    email: string;
    address: string;
    dueDate: string | null;
    returnDate: string | null;
  };
  type: "SELL" | "RENT";
  onUpdateOrderData: (field: string, value: string | null) => void;
  onOpenDatePicker: (mode: "delivery" | "return") => void;
};

export default function CheckoutCustomerInfo(props: CheckoutCustomerInfoProps) {
  const { orderData, type, onUpdateOrderData, onOpenDatePicker } = props;

  const renderField = (
    field: keyof typeof orderData,
    label: string,
    placeholder: string,
    isRequired: boolean = true,
    keyboardType: "default" | "phone-pad" | "email-address" = "default",
    multiline: boolean = false
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label} {isRequired && <Text style={styles.requiredMark}>*</Text>}
        </Text>

        <Input
          value={orderData[field] || ""}
          onChangeText={(text: string) =>
            onUpdateOrderData(field, text || null)
          }
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 2 : 1}
          style={styles.input}
        />
      </View>
    );
  };

  const renderDateField = (
    field: "dueDate" | "returnDate",
    label: string,
    isRequired: boolean = true
  ) => {
    const hasValue = orderData[field] && orderData[field] !== null;
    const mode = field === "dueDate" ? "delivery" : "return";

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label} {isRequired && <Text style={styles.requiredMark}>*</Text>}
        </Text>

        <TouchableOpacity
          onPress={() => onOpenDatePicker(mode)}
          style={styles.dateInput}
        >
          <View style={styles.dateInputContent}>
            <Text
              style={[
                styles.dateInputText,
                hasValue
                  ? styles.dateInputTextFilled
                  : styles.dateInputTextPlaceholder,
              ]}
            >
              {hasValue
                ? orderData[field]
                : field === "returnDate" && type === "SELL"
                  ? "Không cần thiết (đơn hàng mua)"
                  : "Chọn ngày"}
            </Text>
            <Ionicons name="calendar" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person" size={24} color="#3B82F6" />
        <Text style={styles.title}>Thông tin khách hàng</Text>
      </View>

      <Text style={styles.description}>
        Vui lòng điền đầy đủ thông tin để chúng tôi có thể liên hệ và giao hàng
        chính xác.
      </Text>

      <View style={styles.fieldsContainer}>
        {renderField("phone", "Số điện thoại", "044642068", true, "phone-pad")}

        {renderField("email", "Email", "Nhập email", true, "email-address")}

        {renderField(
          "address",
          "Địa chỉ giao hàng",
          "Nhập địa chỉ chi tiết",
          true,
          "default",
          true
        )}

        <View style={styles.dateRow}>
          <View style={styles.halfWidth}>
            {renderDateField("dueDate", "Ngày giao hàng", true)}
          </View>

          {type === "RENT" && (
            <View style={styles.halfWidth}>
              {renderDateField("returnDate", "Ngày trả hàng", true)}
            </View>
          )}
        </View>

        <View style={styles.orderTypeContainer}>
          <View style={styles.orderTypeContent}>
            <Ionicons
              name={type === "SELL" ? "shirt" : "repeat"}
              size={20}
              color={type === "SELL" ? "#E05C78" : "#10B981"}
            />
            <Text style={styles.orderTypeText}>
              Loại đơn hàng: {type === "SELL" ? "Mua váy" : "Thuê váy"}
            </Text>
          </View>
          <Text style={styles.orderTypeSubtext}>
            {type === "SELL"
              ? "Bạn sẽ sở hữu váy này vĩnh viễn"
              : "Bạn sẽ thuê váy trong thời gian nhất định"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  fieldsContainer: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  requiredMark: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
  },
  dateInputContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInputText: {
    fontSize: 16,
  },
  dateInputTextFilled: {
    color: "#111827",
  },
  dateInputTextPlaceholder: {
    color: "#6B7280",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  orderTypeContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderTypeContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 8,
  },
  orderTypeSubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 28,
  },
});
