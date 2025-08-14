import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  transactionApi,
  TransactionItem,
  TransactionParams,
} from "../../services/apis/transaction.api";

const statusColors: { [key: string]: string } = {
  completed: "#10B981",
  pending: "#F59E0B",
  failed: "#EF4444",
};

const typeLabels: { [key: string]: string } = {
  transfer: "Chuyển khoản",
  deposit: "Nạp tiền",
  withdraw: "Rút tiền",
};

const orderTypeLabels: { [key: string]: string } = {
  SELL: "Mua váy",
  RENT: "Thuê váy",
  CUSTOM: "Đặt may",
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt:desc");

  const loadTransactions = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        if (page === 0) setLoading(true);
        else setLoadingMore(true);

        const params: TransactionParams = {
          page,
          size: 10,
          sort: sortBy,
        };

        if (selectedStatus) {
          params.filter = `status:${selectedStatus}`;
        }

        const response = await transactionApi.getMyTransactions(params);

        if (response.statusCode === 200) {
          const newTransactions = response.items;
          setTransactions((prev) =>
            append ? [...prev, ...newTransactions] : newTransactions
          );
          setCurrentPage(response.pageIndex);
          setHasNextPage(response.hasNextPage);
          setTotalItems(response.totalItems);
        }
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Lỗi tải giao dịch",
          text2: error?.message,
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [selectedStatus, sortBy]
  );

  useEffect(() => {
    loadTransactions(0, false);
  }, [loadTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions(0, false);
  };

  const loadMore = () => {
    if (hasNextPage && !loadingMore) {
      loadTransactions(currentPage + 1, true);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const getTransactionDescription = (item: TransactionItem) => {
    if (item.order) {
      const orderType = orderTypeLabels[item.order.type] || item.order.type;
      return `${orderType} - ${item.to}`;
    }
    return item.note || `${typeLabels[item.type] || item.type} - ${item.to}`;
  };

  const filteredTransactions = transactions.filter((item) => {
    if (!searchText) return true;
    const description = getTransactionDescription(item).toLowerCase();
    const amount = item.amount.toLowerCase();
    const from = item.from.toLowerCase();
    const to = item.to.toLowerCase();
    const search = searchText.toLowerCase();
    return (
      description.includes(search) ||
      amount.includes(search) ||
      from.includes(search) ||
      to.includes(search)
    );
  });

  const renderTransaction = ({ item }: { item: TransactionItem }) => {
    const statusColor = statusColors[item.status] || "#6B7280";
    const isOutgoing = item.fromTypeBalance === "available";

    return (
      <TouchableOpacity
        className="bg-white mx-4 mb-3 rounded-xl p-4 shadow-sm border border-gray-100"
        onPress={() => router.push(`/account/transaction-detail/${item.id}`)}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center mr-3`}
              style={{ backgroundColor: `${statusColor}15` }}
            >
              <Ionicons
                name={isOutgoing ? "arrow-up" : "arrow-down"}
                size={20}
                color={statusColor}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-medium text-gray-900 text-sm"
                numberOfLines={1}
              >
                {getTransactionDescription(item)}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text
              className={`font-bold text-sm ${isOutgoing ? "text-red-600" : "text-green-600"}`}
            >
              {isOutgoing ? "-" : "+"} {formatCurrency(item.amount)}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: statusColor }}
              />
              <Text
                className="text-xs capitalize"
                style={{ color: statusColor }}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          {item.order && (
            <View className="flex-1">
              <Text className="text-xs text-gray-500">
                Đơn hàng: {item.order.id.slice(-8)} • {item.order.address}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Đang xử lý", value: "pending" },
    { label: "Thất bại", value: "failed" },
  ];

  const sortOptions = [
    { label: "Mới nhất", value: "createdAt:desc" },
    { label: "Cũ nhất", value: "createdAt:asc" },
    { label: "Số tiền cao", value: "amount:desc" },
    { label: "Số tiền thấp", value: "amount:asc" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 mx-3">
            <Text className="text-lg font-semibold text-gray-800 text-center">
              Lịch sử giao dịch
            </Text>
            <Text className="text-xs text-gray-500 text-center">
              {totalItems} giao dịch
            </Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      {/* Search & Filters */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        {/* Search */}
        <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm kiếm giao dịch..."
            className="flex-1 ml-2 text-sm text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter & Sort */}
        <View className="flex-row space-x-2">
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Trạng thái</Text>
            <View className="flex-row flex-wrap">
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedStatus(option.value)}
                  className={`px-2 py-1 rounded-lg mr-2 mb-1 ${
                    selectedStatus === option.value
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      selectedStatus === option.value
                        ? "text-blue-700"
                        : "text-gray-600"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Sắp xếp</Text>
            <View className="flex-row flex-wrap">
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  className={`px-2 py-1 rounded-lg mr-2 mb-1 ${
                    sortBy === option.value ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      sortBy === option.value
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-gray-600 mt-2">Đang tải giao dịch...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#E05C78" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text className="text-gray-400 mt-2 text-center">
                {searchText
                  ? "Không tìm thấy giao dịch"
                  : "Chưa có giao dịch nào"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
