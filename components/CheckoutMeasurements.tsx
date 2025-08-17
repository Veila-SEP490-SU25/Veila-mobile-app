import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DressDetails } from "../services/apis/order.api";
import Input from "./Input";

type CheckoutMeasurementsProps = {
  measurements: DressDetails;
  onUpdateMeasurement: (field: keyof DressDetails, value: number) => void;
};

export default function CheckoutMeasurements(props: CheckoutMeasurementsProps) {
  const { measurements, onUpdateMeasurement } = props;

  const renderMeasurementField = (
    field: keyof DressDetails,
    label: string,
    placeholder: string,
    unit: string,
    isRequired: boolean = true
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label} {isRequired && <Text style={styles.requiredMark}>*</Text>}
        </Text>

        <Input
          value={String(measurements[field] || 0)}
          onChangeText={(text: string) =>
            onUpdateMeasurement(field, Number(text) || 0)
          }
          placeholder={placeholder}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.unitText}>Đơn vị: {unit}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="body" size={24} color="#10B981" />
        <Text style={styles.title}>Số đo cơ thể</Text>
      </View>

      <Text style={styles.description}>
        Nhập chính xác số đo để váy được may vừa vặn với cơ thể của bạn.
      </Text>

      <View style={styles.fieldsContainer}>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("height", "Chiều cao", "165", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("weight", "Cân nặng", "50", "kg", false)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("bust", "Vòng ngực", "85", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("waist", "Vòng eo", "65", "cm", true)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("hip", "Vòng mông", "90", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("neck", "Vòng cổ", "20", "cm", false)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("shoulderWidth", "Vai", "40", "cm", false)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField(
              "sleeveLength",
              "Tay áo",
              "40",
              "cm",
              false
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField(
              "backLength",
              "Độ dài lưng",
              "60",
              "cm",
              false
            )}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("lowerWaist", "Eo dưới", "50", "cm", false)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField(
              "waistToFloor",
              "Eo đến sàn",
              "60",
              "cm",
              false
            )}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("armpit", "Nách", "10", "cm", false)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("bicep", "Bắp tay", "10", "cm", false)}
          </View>
          <View style={styles.halfWidth}>
            {/* Empty space for alignment */}
          </View>
        </View>
      </View>

      <View style={styles.noteContainer}>
        <Ionicons name="information-circle" size={16} color="#F59E0B" />
        <Text style={styles.noteText}>
          <Text style={styles.noteBold}>Lưu ý:</Text> Các trường có dấu * là bắt
          buộc. Số đo càng chính xác, váy càng vừa vặn.
        </Text>
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
  unitText: {
    fontSize: 12,
    color: "#6B7280",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCD34D",
    gap: 8,
  },
  noteText: {
    fontSize: 12,
    color: "#92400E",
    flex: 1,
    lineHeight: 16,
  },
  noteBold: {
    fontWeight: "600",
  },
});
