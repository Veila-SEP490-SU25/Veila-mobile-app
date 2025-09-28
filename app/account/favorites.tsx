import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { LightStatusBar } from "../../components/StatusBar";
import { useAuth } from "../../providers/auth.provider";
import { dressApi } from "../../services/apis/dress.api";
import { shopApi } from "../../services/apis/shop.api";
import { Dress } from "../../services/types/dress.type";
import { Shop } from "../../services/types/shop.type";
import { formatVNDCustom } from "../../utils/currency.util";

type TabType = "dresses" | "shops";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dresses");
  const [favoriteDresses, setFavoriteDresses] = useState<Dress[]>([]);
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDresses, setLoadingDresses] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

  const loadFavoriteDresses = useCallback(async () => {
    if (!user?.favDresses || user.favDresses.length === 0) {
      setFavoriteDresses([]);
      return;
    }

    try {
      setLoadingDresses(true);
      const dressPromises = user.favDresses.map((id) =>
        dressApi.getDressById(id).catch(() => {
          return null;
        })
      );

      const dressResults = await Promise.all(dressPromises);

      const validDresses = dressResults.filter(
        (dress) => dress !== null && dress.id
      ) as Dress[];

      const favoriteDressesWithFlag = validDresses.map((dress) => ({
        ...dress,
        isFavorite: true,
      }));

      setFavoriteDresses(favoriteDressesWithFlag);

      if (validDresses.length > 0) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đã tải ${validDresses.length}/${user.favDresses.length} váy yêu thích`,
          visibilityTime: 1500,
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Thông báo",
          text2: "Không thể tải được váy yêu thích nào",
          visibilityTime: 2000,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách váy yêu thích",
        visibilityTime: 3000,
      });
    } finally {
      setLoadingDresses(false);
    }
  }, [user?.favDresses]);

  const loadFavoriteShops = useCallback(async () => {
    if (!user?.favShops || user.favShops.length === 0) {
      setFavoriteShops([]);
      return;
    }

    try {
      setLoadingShops(true);
      const shopPromises = user.favShops.map((id) =>
        shopApi.getShopById(id).catch(() => {
          return null;
        })
      );

      const shopResults = await Promise.all(shopPromises);

      const validShops = shopResults.filter(
        (shop) => shop !== null && shop.id
      ) as Shop[];

      const favoriteShopsWithFlag = validShops.map((shop) => ({
        ...shop,
        isFavorite: true,
      }));

      setFavoriteShops(favoriteShopsWithFlag);

      if (validShops.length > 0) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đã tải ${validShops.length}/${user.favShops.length} shop yêu thích`,
          visibilityTime: 1500,
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Thông báo",
          text2: "Không thể tải được shop yêu thích nào",
          visibilityTime: 2000,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải danh sách shop yêu thích",
        visibilityTime: 3000,
      });
    } finally {
      setLoadingShops(false);
    }
  }, [user?.favShops]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === "dresses") {
      await loadFavoriteDresses();
    } else {
      await loadFavoriteShops();
    }

    Toast.show({
      type: "success",
      text1: "Làm mới",
      text2: "Đã cập nhật danh sách yêu thích",
      visibilityTime: 1500,
    });

    setRefreshing(false);
  }, [activeTab, loadFavoriteDresses, loadFavoriteShops]);

  useEffect(() => {
    if (activeTab === "dresses") {
      loadFavoriteDresses();
    } else {
      loadFavoriteShops();
    }
  }, [activeTab, loadFavoriteDresses, loadFavoriteShops]);

  const removeFavoriteDress = async (dressId: string) => {
    try {
      setFavoriteDresses((prev) =>
        prev.filter((dress) => dress.id !== dressId)
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa váy khỏi danh sách yêu thích",
        visibilityTime: 2000,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xóa váy khỏi danh sách yêu thích",
        visibilityTime: 3000,
      });
    }
  };

  const removeFavoriteShop = async (shopId: string) => {
    try {
      setFavoriteShops((prev) => prev.filter((shop) => shop.id !== shopId));

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa shop khỏi danh sách yêu thích",
        visibilityTime: 2000,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xóa shop khỏi danh sách yêu thích",
        visibilityTime: 3000,
      });
    }
  };

  const renderTabButton = (
    tab: TabType,
    label: string,
    icon: string,
    count: number
  ) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg ${
        activeTab === tab ? "bg-primary-500" : "bg-gray-100"
      }`}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? "#FFFFFF" : "#6B7280"}
        className="mr-2"
      />
      <Text
        className={`text-sm font-medium ${
          activeTab === tab ? "text-white" : "text-gray-700"
        }`}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderDressItem = ({ item }: { item: Dress }) => (
    <Card className="mb-4">
      <View className="flex-row">
        <View className="w-20 h-20 rounded-lg bg-gray-200 mr-3 overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="shirt-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            {item.name || "Tên váy"}
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            {item.description
              ? `${item.description.substring(0, 60)}...`
              : "Không có mô tả"}
          </Text>

          <View className="flex-row items-center space-x-4 mb-2">
            {item.sellPrice && (
              <Text className="text-primary-600 font-semibold">
                {formatVNDCustom(item.sellPrice, "₫")}
              </Text>
            )}
            {item.rentalPrice && (
              <Text className="text-green-600 font-semibold">
                Thuê: {formatVNDCustom(item.rentalPrice, "₫")}
              </Text>
            )}
          </View>

          <View className="flex-row items-center space-x-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-sm text-gray-600 ml-1">
                {item.ratingAverage || "0"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text className="text-sm text-gray-600 ml-1">
                {item.ratingCount || 0}
              </Text>
            </View>
          </View>
        </View>

        <View className="ml-2">
          <View className="p-2 rounded-full bg-red-50 mb-2">
            <Ionicons name="heart" size={20} color="#EF4444" />
          </View>
          <TouchableOpacity
            onPress={() => removeFavoriteDress(item.id)}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="heart-dislike" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3 mt-3">
        <View className="flex-1">
          <Button
            title="Xem chi tiết"
            onPress={() => router.replace(`/dress/${item.id}` as any)}
            variant="outline"
            size="small"
            fullWidth
          />
        </View>
        {item.sellPrice && (
          <Button
            title="Mua ngay"
            onPress={() =>
              router.push(
                `/payment/checkout?dressId=${item.id}&type=SELL` as any
              )
            }
            size="small"
            fullWidth
          />
        )}
      </View>
    </Card>
  );

  const renderShopItem = ({ item }: { item: Shop }) => (
    <Card className="mb-4">
      <View className="flex-row">
        {/* Shop Logo */}
        <View className="w-20 h-20 rounded-lg bg-gray-200 mr-3 overflow-hidden">
          {item.logoUrl ? (
            <Image
              source={{ uri: item.logoUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="business-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            {item.address || "Không có mô tả"}
          </Text>

          <View className="flex-row items-center space-x-2 mb-2">
            <View className="flex-row items-center">
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{item.phone}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{item.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600" numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>

        <View className="ml-2">
          <TouchableOpacity
            onPress={() => removeFavoriteShop(item.id)}
            className="p-2 rounded-full bg-red-50"
          >
            <Ionicons name="heart-dislike" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row space-x-3 mt-3">
        <View className="flex-1">
          <Button
            title="Xem shop"
            onPress={() => router.push(`/shop/${item.id}` as any)}
            variant="outline"
            size="small"
            fullWidth
          />
        </View>
        <Button
          title="Xem váy"
          onPress={() => router.push(`/dresses?shopId=${item.id}` as any)}
          size="small"
          fullWidth
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View className="py-12 items-center">
      <Ionicons
        name={activeTab === "dresses" ? "shirt-outline" : "business-outline"}
        size={64}
        color="#CCCCCC"
      />
      <Text className="text-gray-400 text-center mt-4 text-lg">
        {activeTab === "dresses"
          ? "Chưa có váy yêu thích nào"
          : "Chưa có shop yêu thích nào"}
      </Text>
      <Text className="text-gray-400 text-center mt-2 text-sm">
        {activeTab === "dresses"
          ? "Hãy khám phá và thêm váy vào danh sách yêu thích"
          : "Hãy khám phá và thêm shop vào danh sách yêu thích"}
      </Text>
      <Button
        title="Khám phá ngay"
        onPress={() => router.push("/_tab/shopping" as any)}
        className="mt-6"
      />
    </View>
  );

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/_tab/account" as any);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LightStatusBar />

      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBackPress} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Yêu thích</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/_tab/shopping" as any)}
            className="p-2"
          >
            <Ionicons name="add-circle-outline" size={24} color="#E05C78" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row space-x-3">
          {renderTabButton(
            "dresses",
            "Váy yêu thích",
            "shirt-outline",
            favoriteDresses.length
          )}
          {renderTabButton(
            "shops",
            "Shop yêu thích",
            "business-outline",
            favoriteShops.length
          )}
        </View>

        <View className="mt-3 px-2">
          <Text className="text-xs text-gray-500 text-center">
            {activeTab === "dresses"
              ? `Có ${user?.favDresses?.length || 0} ID váy yêu thích, đã tải được ${favoriteDresses.length}`
              : `Có ${user?.favShops?.length || 0} ID shop yêu thích, đã tải được ${favoriteShops.length}`}
          </Text>
        </View>
      </View>

      {activeTab === "dresses" ? (
        loadingDresses ? (
          <View className="flex-1 px-6 py-4">
            <View className="bg-white p-6 rounded-lg items-center">
              <Text className="text-gray-800 mb-2">
                Đang tải váy yêu thích...
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Đang lấy thông tin từ {user?.favDresses?.length || 0} váy yêu
                thích
              </Text>
            </View>
          </View>
        ) : favoriteDresses.length === 0 ? (
          <View className="flex-1 px-6 py-4">{renderEmptyState()}</View>
        ) : (
          <FlatList
            data={favoriteDresses}
            renderItem={renderDressItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )
      ) : loadingShops ? (
        <View className="flex-1 px-6 py-4">
          <View className="bg-white p-6 rounded-lg items-center">
            <Text className="text-gray-800 mb-2">
              Đang tải shop yêu thích...
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Đang lấy thông tin từ {user?.favShops?.length || 0} shop yêu thích
            </Text>
          </View>
        </View>
      ) : favoriteShops.length === 0 ? (
        <View className="flex-1 px-6 py-4">{renderEmptyState()}</View>
      ) : (
        <FlatList
          data={favoriteShops}
          renderItem={renderShopItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}
