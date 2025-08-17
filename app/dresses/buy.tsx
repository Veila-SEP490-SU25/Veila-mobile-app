import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DressGrid from "../../components/shopping/DressGrid";

export default function BuyDressesScreen() {
  const handleDressPress = (dress: any) => {
    router.push(`/dress/${dress.id}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Váy cưới để mua</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* DressGrid for buying */}
      <DressGrid
        mode="buy"
        onDressPress={handleDressPress}
        disableScroll={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 70,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E05C78",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
});
