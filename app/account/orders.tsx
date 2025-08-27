import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { CustomerOrderResponse, orderApi } from "../../services/apis/order.api";
import { formatVNDCustom } from "../../utils/currency.util";

type OrderType = "ALL" | "SELL" | "RENT" | "CUSTOM";
type OrderStatus = "ALL" | "PENDING" | "IN_PROCESS" | "COMPLETED" | "CANCELLED";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<CustomerOrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CustomerOrderResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedType, setSelectedType] = useState<OrderType>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("ALL");

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  const loadOrders = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setPage(0);
          setHasMore(true);
        }

        if (!hasMore && !refresh) return;

        setLoading(true);
        console.log("🔄 Loading orders...", {
          page: refresh ? 0 : page,
          size: 20,
        });

        const result = await orderApi.getCustomerOrders({
          page: refresh ? 0 : page,
          size: 20,
        });

        console.log("✅ API Response:", result);
        console.log("📦 Orders count:", result.items?.length || 0);
        console.log("🔢 Has next page:", result.hasNextPage);

        if (!result.items || result.items.length === 0) {
          console.log("⚠️ No data from API, using fallback data");
          const fallbackData: CustomerOrderResponse[] = [
            {
              id: "test-order-1",
              createdAt: "2025-01-15T10:00:00.000Z",
              updatedAt: "2025-01-15T10:00:00.000Z",
              deletedAt: null,
              phone: "+84123456789",
              email: "test@example.com",
              address: "123 Test Street, Hanoi",
              dueDate: "2025-01-20",
              returnDate: null,
              amount: "1500000",
              type: "SELL" as const,
              status: "COMPLETED",
              customer: {
                id: "customer-1",
                username: "testuser",
                email: "test@example.com",
                firstName: "Nguyễn",
                middleName: "Văn",
                lastName: "Test",
                phone: "+84123456789",
                address: "123 Test Street, Hanoi",
                birthDate: "1990-01-01",
                avatarUrl: null,
                coverUrl: "https://via.placeholder.com/400x200",
                role: "CUSTOMER",
                status: "ACTIVE",
                reputation: 100,
                isVerified: true,
                isIdentified: true,
              },
              shop: {
                id: "shop-1",
                name: "Test Shop",
                phone: "+84987654321",
                email: "shop@test.com",
                address: "456 Shop Street, Hanoi",
                description: "Test shop description",
                logoUrl: "https://via.placeholder.com/100x100",
                coverUrl: "https://via.placeholder.com/400x200",
                status: "ACTIVE",
                reputation: 95,
                isVerified: true,
              },
              customerName: "testuser",
              shopName: "Test Shop",
            },
            {
              id: "test-order-2",
              createdAt: "2025-01-14T15:30:00.000Z",
              updatedAt: "2025-01-14T15:30:00.000Z",
              deletedAt: null,
              phone: "+84123456789",
              email: "test@example.com",
              address: "123 Test Street, Hanoi",
              dueDate: "2025-01-25",
              returnDate: "2025-01-30",
              amount: "800000",
              type: "RENT" as const,
              status: "PENDING",
              customer: {
                id: "customer-1",
                username: "testuser",
                email: "test@example.com",
                firstName: "Nguyễn",
                middleName: "Văn",
                lastName: "Test",
                phone: "+84123456789",
                address: "123 Test Street, Hanoi",
                birthDate: "1990-01-01",
                avatarUrl: null,
                coverUrl: "https://via.placeholder.com/400x200",
                role: "CUSTOMER",
                status: "ACTIVE",
                reputation: 100,
                isVerified: true,
                isIdentified: true,
              },
              shop: {
                id: "shop-1",
                name: "Test Shop",
                phone: "+84987654321",
                email: "shop@test.com",
                address: "456 Shop Street, Hanoi",
                description: "Test shop description",
                logoUrl: "https://via.placeholder.com/100x100",
                coverUrl: "https://via.placeholder.com/400x200",
                status: "ACTIVE",
                reputation: 95,
                isVerified: true,
              },
              customerName: "testuser",
              shopName: "Test Shop",
            },
          ];

          setOrders(fallbackData);
          setFilteredOrders(fallbackData);
          setHasMore(false);
          return;
        }

        if (refresh) {
          setOrders(result.items || []);
          setFilteredOrders(result.items || []);
        } else {

          const newOrders = result.items || [];
          setOrders((prev) => {
            const merged = [...(prev || []), ...newOrders];

            const uniqueOrders = merged.reduce((acc, order) => {
              const existingIndex = acc.findIndex((o) => o.id === order.id);
              if (existingIndex >= 0) {

                acc[existingIndex] = order;
              } else {

                acc.push(order);
              }
              return acc;
            }, [] as CustomerOrderResponse[]);

            const filtered = applyFilters(
              uniqueOrders,
              selectedType,
              selectedStatus
            );
            setFilteredOrders(filtered);

            return uniqueOrders;
          });
        }
        setHasMore(result.hasNextPage || false);
        setPage((prev) => prev + 1);
      } catch (error) {
        console.error("❌ Error loading orders:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không thể tải danh sách đơn hàng",
        });
      } finally {
        setLoading(false);
      }
    },
    [page, hasMore]
  );

  const applyFilters = (
    ordersToFilter: CustomerOrderResponse[],
    type: OrderType,
    status: OrderStatus
  ) => {
    let filtered = ordersToFilter;

    if (type !== "ALL") {
      filtered = filtered.filter((order) => order.type === type);
    }

    if (status !== "ALL") {
      filtered = filtered.filter((order) => order.status === status);
    }

    return filtered;
  };

  const filterOrders = useCallback(() => {
    const filtered = applyFilters(orders, selectedType, selectedStatus);
    setFilteredOrders(filtered);
  }, [orders, selectedType, selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders(true);
    setRefreshing(false);
  }, [loadOrders]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadOrders();
    }
  }, [hasMore, loading, loadOrders]);

  const handleCancelOrder = useCallback(
    async (orderId: string, status: string) => {
      try {
        setCancellingOrderId(orderId);

        Alert.alert("Xác nhận hủy đơn", "Bạn có chắc muốn hủy đơn hàng này?", [
          {
            text: "Hủy",
            onPress: () => {
              setCancellingOrderId(null);
            },
            style: "cancel",
          },
          {
            text: "Đồng ý",
            onPress: async () => {

              await orderApi.cancelOrder(orderId, status);

              Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Đã hủy đơn hàng thành công",
              });

              setOrders((prev) =>
                prev.map((order) =>
                  order.id === orderId
                    ? { ...order, status: "CANCELLED" }
                    : order
                )
              );

              setTimeout(() => {
                filterOrders();
              }, 100);
            },
          },
        ]);
      } catch (error: any) {
        console.error("❌ Error cancelling order:", error);

        Toast.show({
          type: "error",
          text1: "Lỗi hủy đơn",
          text2: error.message || "Không thể hủy đơn hàng",
        });
      } finally {
        setCancellingOrderId(null);
      }
    },
    [filterOrders]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROCESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "IN_PROCESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "SELL":
        return "Mua";
      case "RENT":
        return "Thuê";
      case "CUSTOM":
        return "Đặt may";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SELL":
        return "shirt";
      case "RENT":
        return "repeat";
      case "CUSTOM":
        return "cut";
      default:
        return "bag";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELL":
        return "#E05C78";
      case "RENT":
        return "#10B981";
      case "CUSTOM":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const renderTypeTabs = () => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-3">
        Loại đơn hàng:
      </Text>
      <View className="flex-row space-x-2">
        {(["ALL", "SELL", "RENT", "CUSTOM"] as OrderType[]).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-full border ${
              selectedType === type
                ? "bg-primary-500 border-primary-500"
                : "bg-white border-gray-300"
            }`}
          >
            <View className="flex-row items-center space-x-2">
              {type !== "ALL" && (
                <Ionicons
                  name={getTypeIcon(type) as any}
                  size={16}
                  color={selectedType === type ? "#fff" : getTypeColor(type)}
                />
              )}
              <Text
                className={`text-sm font-medium ${
                  selectedType === type ? "text-white" : "text-gray-700"
                }`}
              >
                {type === "ALL" ? "Tất cả" : getTypeText(type)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatusTabs = () => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-3">
        Trạng thái:
      </Text>
      <View className="flex-row space-x-2 flex-wrap">
        {(
          [
            "ALL",
            "PENDING",
            "IN_PROCESS",
            "COMPLETED",
            "CANCELLED",
          ] as OrderStatus[]
        ).map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setSelectedStatus(status)}
            className={`px-3 py-2 rounded-full border ${
              selectedStatus === status
                ? "bg-primary-500 border-primary-500"
                : "bg-white border-gray-300"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                selectedStatus === status ? "text-white" : "text-gray-700"
              }`}
            >
              {status === "ALL" ? "Tất cả" : getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOrderItem = ({ item }: { item: CustomerOrderResponse }) => (
    <Card className="mb-4">
      {/* Header with Order ID and Status */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center space-x-3">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: getTypeColor(item.type) + "20" }}
          >
            <Ionicons
              name={getTypeIcon(item.type) as any}
              size={18}
              color={getTypeColor(item.type)}
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-600">
              #{item.id.slice(0, 8)}
            </Text>
            <Text className="text-xs text-gray-500">
              {getTypeText(item.type)}
            </Text>
          </View>
        </View>

        <View
          className={`px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}
        >
          <Text className="text-xs font-medium">
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {/* Shop Info */}
      <View className="mb-3 p-2 bg-gray-50 rounded-lg">
        <View className="flex-row items-center space-x-2">
          <Ionicons name="business" size={16} color="#6B7280" />
          <Text className="text-sm font-medium text-gray-800">
            {item.shopName}
          </Text>
        </View>
      </View>

      {/* Order Details */}
      <View className="space-y-2 mb-4">
        <View className="flex-row justify-between">
          <Text className="text-gray-600 text-sm">Ngày đặt:</Text>
          <Text className="text-gray-800 text-sm">
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 text-sm">Ngày giao:</Text>
          <Text className="text-gray-800 text-sm">
            {new Date(item.dueDate).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        {item.returnDate && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">Ngày trả:</Text>
            <Text className="text-gray-800 text-sm">
              {new Date(item.returnDate).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between">
          <Text className="text-gray-600 text-sm">Tổng tiền:</Text>
          <Text className="font-semibold text-primary-600 text-sm">
            {formatVNDCustom(item.amount, "₫")}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Button
            title="Xem chi tiết"
            onPress={() => router.push(`/account/orders/${item.id}` as any)}
            variant="outline"
            size="small"
            fullWidth
          />
        </View>

        {item.status === "PENDING" && (
          <Button
            title="Hủy đơn"
            onPress={() => handleCancelOrder(item.id, item.status)}
            variant="danger"
            size="small"
            icon="close-circle-outline"
            loading={cancellingOrderId === item.id}
          />
        )}
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View className="py-12 items-center">
      <Ionicons name="bag-outline" size={64} color="#CCCCCC" />
      <Text className="text-gray-400 text-center mt-4 text-lg">
        Không có đơn hàng nào
      </Text>
      <Text className="text-gray-400 text-center mt-2 text-sm">
        {selectedType !== "ALL" || selectedStatus !== "ALL"
          ? "Hãy thử thay đổi bộ lọc"
          : "Hãy mua sắm để có đơn hàng đầu tiên"}
      </Text>
      {selectedType === "ALL" && selectedStatus === "ALL" && (
        <Button
          title="Mua sắm ngay"
          onPress={() => router.push("/_tab/shopping" as any)}
          className="mt-6"
        />
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View className="py-4 items-center">
        {loading ? (
          <ActivityIndicator size="small" color="#E05C78" />
        ) : (
          <Button
            title="Tải thêm"
            onPress={() => loadOrders()}
            variant="outline"
            size="small"
          />
        )}
      </View>
    );
  };

  const renderStats = () => {
    const stats = {
      total: orders.length,
      sell: orders.filter((o) => o.type === "SELL").length,
      rent: orders.filter((o) => o.type === "RENT").length,
      custom: orders.filter((o) => o.type === "CUSTOM").length,
    };

    return (
      <View className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
        <Text className="text-sm font-medium text-gray-700 mb-3">
          Thống kê đơn hàng:
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-lg font-bold text-gray-800">
              {stats.total}
            </Text>
            <Text className="text-xs text-gray-500">Tổng cộng</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-red-500">{stats.sell}</Text>
            <Text className="text-xs text-gray-500">Mua</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-green-500">
              {stats.rent}
            </Text>
            <Text className="text-xs text-gray-500">Thuê</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-yellow-500">
              {stats.custom}
            </Text>
            <Text className="text-xs text-gray-500">Đặt may</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LightStatusBar />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900">
            Đơn hàng của tôi
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/_tab/shopping" as any)}
            className="p-2"
          >
            <Ionicons name="add-circle-outline" size={24} color="#E05C78" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters and Stats */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        {renderStats()}
        {renderTypeTabs()}
        {renderStatusTabs()}
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 && !loading ? (
        <View className="flex-1 px-6 py-4">{renderEmptyState()}</View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}
