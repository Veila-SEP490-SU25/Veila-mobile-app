import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IAddress } from "../../services/types";

interface AddressDisplayProps {
  address: IAddress;
  showLabels?: boolean;
  compact?: boolean;
}

export default function AddressDisplay({
  address,
  showLabels = false,
  compact = false,
}: AddressDisplayProps) {
  if (!address.province) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={16} color="#9CA3AF" />
        <Text style={styles.emptyText}>Chưa chọn địa chỉ</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="location" size={14} color="#10B981" />
        <Text style={styles.compactText} numberOfLines={1}>
          {address.streetAddress && `${address.streetAddress}, `}
          {address.ward?.name && `${address.ward.name}, `}
          {address.district?.name && `${address.district.name}, `}
          {address.province?.name}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>Địa chỉ:</Text>
        </View>
      )}

      <View style={styles.addressContainer}>
        {address.streetAddress && (
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color="#10B981" />
            <Text style={styles.addressText}>{address.streetAddress}</Text>
          </View>
        )}

        {address.ward && (
          <View style={styles.addressRow}>
            <Ionicons name="business" size={14} color="#6B7280" />
            <Text style={styles.addressText}>
              {address.ward.name} ({address.ward.typeText})
            </Text>
          </View>
        )}

        {address.district && (
          <View style={styles.addressRow}>
            <Ionicons name="business" size={14} color="#6B7280" />
            <Text style={styles.addressText}>
              {address.district.name} ({address.district.typeText})
            </Text>
          </View>
        )}

        {address.province && (
          <View style={styles.addressRow}>
            <Ionicons name="business" size={14} color="#6B7280" />
            <Text style={styles.addressText}>
              {address.province.name} ({address.province.typeText})
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  labelsContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  addressContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  compactText: {
    fontSize: 12,
    color: "#065F46",
    marginLeft: 4,
    flex: 1,
  },
  emptyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontStyle: "italic",
  },
});
