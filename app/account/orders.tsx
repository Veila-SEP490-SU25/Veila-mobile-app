import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { orderApi } from "../../services/apis/order.api";
import { Order } from "../../services/types/order.type";

const statusColor = {
  PENDING: "#F59E0B",
  IN_PROCESS: "#3B82F6",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
};

const statusTabs = [
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "IN_PROCESS", label: "Đang xử lý" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã huỷ" },
];

const typeTabs = [
  { key: "SELL", label: "Đơn mua" },
  { key: "RENT", label: "Đơn thuê" },
  { key: "CUSTOM", label: "Đặt may" },
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [selectedType, setSelectedType] = useState("SELL");
  const router = useRouter();

  const loadOrders = useCallback(
    async (pageNum: number = 0, refresh: boolean = false) => {
      try {
        const response = await orderApi.getOrders(pageNum, 10);
        if (refresh) {
          setOrders(response.items);
        } else {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newItems = response.items.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...newItems];
          });
        }
        setHasMore(response.hasNextPage);
        setPage(pageNum);
      } catch {
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadOrders(0, true);
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders(0, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadOrders(page + 1);
    }
  };

  const filteredOrders = orders.filter(
    (o) => o.type === selectedType && o.status === selectedStatus
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      className="mb-4 bg-white rounded-2xl shadow-card p-4 flex-row items-center"
      onPress={() => router.push(`/account/order/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <View className="flex-1">
        <Text className="font-bold text-base text-primary-600 mb-1">
          {item.shopName}
        </Text>
        <Text className="text-gray-500 text-sm mb-1">{item.customerName}</Text>
        <Text className="text-xs text-gray-400 mb-1">{item.address}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="pricetag-outline" size={16} color="#E05C78" />
          <Text className="ml-2 text-sm text-primary-600 font-semibold">
            {item.amount.toLocaleString()}đ
          </Text>
        </View>
      </View>
      <View className="items-end">
        <View className="flex-row items-center mb-2">
          <Ionicons
            name="ellipse"
            size={12}
            color={
              statusColor[item.status as keyof typeof statusColor] || "#999"
            }
          />
          <Text
            className="ml-2 text-xs font-semibold"
            style={{
              color:
                statusColor[item.status as keyof typeof statusColor] || "#999",
            }}
          >
            {item.status}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 pb-2 px-4 bg-white shadow-sm z-10">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-primary-100 justify-center items-center mr-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#E05C78" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-primary-600">
            Đơn đã mua
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-row justify-between gap-2 pb-1 mb-2">
          {typeTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-2 rounded-full items-center ${selectedType === tab.key ? "bg-primary-100" : ""}`}
              onPress={() => setSelectedType(tab.key)}
              activeOpacity={0.85}
            >
              <Text
                className={`text-xs font-semibold ${selectedType === tab.key ? "text-primary-600" : "text-gray-500"}`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row justify-between gap-2 pb-1">
          {statusTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-2 rounded-full items-center ${selectedStatus === tab.key ? "bg-primary-100" : ""}`}
              onPress={() => setSelectedStatus(tab.key)}
              activeOpacity={0.85}
            >
              <Text
                className={`text-xs font-semibold ${selectedStatus === tab.key ? "text-primary-600" : "text-gray-500"}`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Danh sách đơn hàng */}
      {loading && filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center items-center py-10 bg-white">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="mt-4 text-base text-gray-500">
            Đang tải đơn hàng...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            hasMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#E05C78" />
                <Text className="mt-2 text-sm text-gray-400">
                  Đang tải thêm...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <Ionicons name="cube-outline" size={64} color="#CCCCCC" />
                <Text className="text-xl font-bold text-gray-400 mt-6 mb-2">
                  Không có đơn hàng nào
                </Text>
                <Text className="text-base text-gray-400 text-center">
                  Bạn chưa có đơn hàng nào
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
