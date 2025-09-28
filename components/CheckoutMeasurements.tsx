import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DressDetails } from "../services/apis/order.api";
import Input from "./Input";

type CheckoutMeasurementsProps = {
  measurements: DressDetails;
  onUpdateMeasurement: (field: keyof DressDetails, value: number) => void;
  validationErrors?: { [key: string]: string };
};

export default function CheckoutMeasurements(props: CheckoutMeasurementsProps) {
  const { measurements, onUpdateMeasurement, validationErrors = {} } = props;

  const renderMeasurementField = (
    field: keyof DressDetails,
    label: string,
    placeholder: string,
    unit: string,
    isRequired: boolean = true
  ) => {
    const errorKey = `measurement_${String(field)}`;
    const error = validationErrors[errorKey];

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
          style={[styles.input, error ? { borderColor: "#EF4444" } : {}]}
        />

        <Text style={styles.unitText}>Đơn vị: {unit}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Helper text cho validation ranges */}
        {!error && (
          <Text style={styles.helperText}>
            {getValidationHelperText(field)}
          </Text>
        )}
      </View>
    );
  };

  const getValidationHelperText = (field: keyof DressDetails): string => {
    const ranges: Record<
      keyof DressDetails,
      { min: number; max: number; unit: string }
    > = {
      dressId: { min: 0, max: 0, unit: "" },
      height: { min: 130, max: 200, unit: "cm" },
      weight: { min: 30, max: 100, unit: "kg" },
      bust: { min: 50, max: 150, unit: "cm" },
      waist: { min: 40, max: 100, unit: "cm" },
      hip: { min: 40, max: 150, unit: "cm" },
      armpit: { min: 10, max: 40, unit: "cm" },
      bicep: { min: 10, max: 40, unit: "cm" },
      neck: { min: 20, max: 50, unit: "cm" },
      shoulderWidth: { min: 20, max: 50, unit: "cm" },
      sleeveLength: { min: 0, max: 100, unit: "cm" },
      backLength: { min: 30, max: 60, unit: "cm" },
      lowerWaist: { min: 5, max: 30, unit: "cm" },
      waistToFloor: { min: 0, max: 200, unit: "cm" },
    };

    const range = ranges[field];
    if (!range) return "";

    if (range.min === 0) {
      return `Phạm vi: 0 - ${range.max} ${range.unit}`;
    }
    return `Phạm vi: ${range.min} - ${range.max} ${range.unit}`;
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
            {renderMeasurementField("height", "Chiều cao", "160", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("weight", "Cân nặng", "55", "kg", true)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("bust", "Vòng ngực", "85", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("waist", "Vòng eo", "70", "cm", true)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("hip", "Vòng mông", "90", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("neck", "Vòng cổ", "35", "cm", true)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("shoulderWidth", "Vai", "35", "cm", true)}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("sleeveLength", "Tay áo", "0", "cm", false)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField(
              "backLength",
              "Độ dài lưng",
              "45",
              "cm",
              true
            )}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("lowerWaist", "Eo dưới", "15", "cm", true)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField(
              "waistToFloor",
              "Eo đến sàn",
              "0",
              "cm",
              false
            )}
          </View>
          <View style={styles.halfWidth}>
            {renderMeasurementField("armpit", "Nách", "25", "cm", true)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {renderMeasurementField("bicep", "Bắp tay", "25", "cm", true)}
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
          buộc. Số đo càng chính xác, váy càng vừa vặn. Các số đo đã được set
          sẵn theo chuẩn trung bình.
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
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
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
