import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import AccessorySelector from "../components/shopping/AccessorySelector";
import { shopApi } from "../services/apis/shop.api";

export default function AccessorySelectorPage() {
  const { shopId, mode = "buy" } = useLocalSearchParams<{
    shopId: string;
    mode: string;
  }>();
  const [accessories, setAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<any[]>([]);

  const loadShopAccessories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Loading accessories for shop:", shopId);

      const response = await shopApi.getShopAccessories(shopId, 0, 50);

      console.log("🔍 API Response:", response);

      if (response && response.items && Array.isArray(response.items)) {
        // Transform API data to match AccessorySelector interface
        const transformedAccessories = response.items.map((item) => ({
          id: item.id,
          name: item.name,
          images: item.images || [],
          sellPrice: item.sellPrice || "0",
          rentalPrice: item.rentalPrice || "0",
          isSellable: item.isSellable || false,
          isRentable: item.isRentable || false,
          status: item.status || "AVAILABLE",
          user: {
            shop: {
              id: shopId,
              name: "Shop", // You can get this from shop detail if needed
              address: "",
              logoUrl: "",
              reputation: 0,
            },
          },
          category: {
            id: "",
            name: "accessory",
            type: "ACCESSORY",
          },
        }));

        console.log("🔍 Transformed accessories:", transformedAccessories);
        setAccessories(transformedAccessories);
      } else {
        console.log("🔍 No accessories found or invalid response");
        setAccessories([]);
      }
    } catch (error) {
      console.error("❌ Error loading accessories:", error);
      setError("Không thể tải danh sách phụ kiện");
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách phụ kiện",
      });
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId) {
      loadShopAccessories();
    }
  }, [shopId, loadShopAccessories]);

  const handleSelectionChange = (accessories: any[]) => {
    setSelectedAccessories(accessories);
    console.log("Selected accessories:", accessories);
  };

  const handleContinue = () => {
    if (selectedAccessories.length === 0) {
      Toast.show({
        type: "info",
        text1: "Thông báo",
        text2: "Vui lòng chọn ít nhất một phụ kiện",
      });
      return;
    }

    console.log("Continuing with accessories:", selectedAccessories);

    // Navigate to next step or submit order
    // You can pass selectedAccessories as params
    router.back();
  };

  const handleRefresh = () => {
    loadShopAccessories();
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Chọn phụ kiện</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E05C78" />
          <Text style={styles.loadingText}>Đang tải phụ kiện...</Text>
        </View>
      </View>
    );
  }

  if (error) {
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
          <Text style={styles.headerTitle}>Chọn phụ kiện</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Không thể tải phụ kiện</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Chọn phụ kiện</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#E05C78" />
        </TouchableOpacity>
      </View>

      {/* Mode Display */}
      <View style={styles.modeDisplay}>
        <Text style={styles.modeText}>
          Chế độ: {mode === "buy" ? "Mua váy" : "Thuê váy"}
        </Text>
        <Text style={styles.accessoryCount}>
          {accessories.length} phụ kiện có sẵn
        </Text>
      </View>

      {/* Accessory Selector */}
      <AccessorySelector
        accessories={accessories}
        mode={mode as "buy" | "rent"}
        onSelectionChange={handleSelectionChange}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedAccessories.length === 0 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={selectedAccessories.length === 0}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modeDisplay: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  accessoryCount: {
    fontSize: 14,
    color: "#666666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#E05C78",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  backButtonText: {
    color: "#E05C78",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#E05C78",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
