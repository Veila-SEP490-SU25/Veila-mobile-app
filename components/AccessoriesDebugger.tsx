import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { dressApi } from "../services/apis/dress.api";
import { shopApi } from "../services/apis/shop.api";

interface AccessoriesDebuggerProps {
  dressId?: string;
  shopId?: string;
}

export default function AccessoriesDebugger({
  dressId,
  shopId,
}: AccessoriesDebuggerProps) {
  const [dressData, setDressData] = useState<any>(null);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDressLoading = async () => {
    if (!dressId) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Testing dress loading for ID:", dressId);
      const dress = await dressApi.getDressById(dressId);
      setDressData(dress);

      console.log("✅ Dress loaded:", {
        id: dress.id,
        name: dress.name,
        hasUser: !!dress.user,
        hasShop: !!dress.user?.shop,
        shopId: dress.user?.shop?.id,
        fullUserData: dress.user,
      });
    } catch (err) {
      console.error("❌ Error loading dress:", err);
      setError(`Error loading dress: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testAccessoriesLoading = async (targetShopId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Testing accessories loading for shop:", targetShopId);
      const response = await shopApi.getShopAccessories(targetShopId, 0, 10);

      console.log("✅ Accessories API response:", {
        success: !!response,
        hasItems: !!response.items,
        itemsCount: response.items?.length || 0,
        response: response,
      });

      if (response && response.items && Array.isArray(response.items)) {
        setAccessories(response.items);
      } else {
        setAccessories([]);
        setError("Invalid response format or no items");
      }
    } catch (err) {
      console.error("❌ Error loading accessories:", err);
      setError(`Error loading accessories: ${err}`);
      setAccessories([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setDressData(null);
    setAccessories([]);
    setError(null);
  };

  return (
    <View className="p-4 bg-gray-100 rounded-lg m-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">
        🔍 Accessories Debugger
      </Text>

      <View className="space-y-3 mb-4">
        <Text className="text-sm text-gray-600">
          Dress ID: {dressId || "Not provided"}
        </Text>
        <Text className="text-sm text-gray-600">
          Shop ID: {shopId || "Not provided"}
        </Text>
      </View>

      <View className="flex-row space-x-2 mb-4">
        <TouchableOpacity
          className="bg-blue-500 px-3 py-2 rounded-lg"
          onPress={testDressLoading}
          disabled={!dressId || loading}
        >
          <Text className="text-white text-sm font-medium">
            Test Dress Loading
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 px-3 py-2 rounded-lg"
          onPress={() =>
            testAccessoriesLoading(shopId || dressData?.user?.shop?.id || "")
          }
          disabled={(!shopId && !dressData?.user?.shop?.id) || loading}
        >
          <Text className="text-white text-sm font-medium">
            Test Accessories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-500 px-3 py-2 rounded-lg"
          onPress={clearData}
        >
          <Text className="text-white text-sm font-medium">Clear</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text className="text-blue-600 text-center">Loading...</Text>}

      {error && (
        <View className="bg-red-50 p-3 rounded-lg border border-red-200">
          <Text className="text-red-800 text-sm">{error}</Text>
        </View>
      )}

      {dressData && (
        <View className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
          <Text className="text-blue-800 font-medium mb-2">Dress Data:</Text>
          <Text className="text-blue-700 text-sm">ID: {dressData.id}</Text>
          <Text className="text-blue-700 text-sm">Name: {dressData.name}</Text>
          <Text className="text-blue-700 text-sm">
            Has User: {dressData.user ? "Yes" : "No"}
          </Text>
          <Text className="text-blue-700 text-sm">
            Has Shop: {dressData.user?.shop ? "Yes" : "No"}
          </Text>
          <Text className="text-blue-700 text-sm">
            Shop ID: {dressData.user?.shop?.id || "None"}
          </Text>
        </View>
      )}

      {accessories.length > 0 && (
        <View className="bg-green-50 p-3 rounded-lg border border-green-200">
          <Text className="text-green-800 font-medium mb-2">
            Accessories ({accessories.length}):
          </Text>
          <ScrollView className="max-h-32">
            {accessories.map((acc, index) => (
              <Text key={acc.id} className="text-green-700 text-sm">
                {index + 1}. {acc.name} (ID: {acc.id})
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
