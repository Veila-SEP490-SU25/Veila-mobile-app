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
import {
  transactionApi,
  TransactionItem,
  TransactionParams,
} from "../../services/apis/transaction.api";
import { showMessage } from "../../utils/message.util";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  TRANSFER = "TRANSFER",
  RECEIVE = "RECEIVE",
  REFUND = "REFUND",
}

const statusColors: { [key: string]: string } = {
  COMPLETED: "#10B981",
  PENDING: "#F59E0B",
  FAILED: "#EF4444",

  completed: "#10B981",
  pending: "#F59E0B",
  failed: "#EF4444",
};

const typeLabels: { [key: string]: string } = {
  [TransactionType.TRANSFER]: "Chuyển khoản",
  [TransactionType.DEPOSIT]: "Nạp tiền",
  [TransactionType.WITHDRAW]: "Rút tiền",
  [TransactionType.RECEIVE]: "Nhận tiền",
  [TransactionType.REFUND]: "Hoàn tiền",
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
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [prioritizePending, setPrioritizePending] = useState<boolean>(true);

  const loadTransactions = useCallback(
    async (page: number = 0, append: boolean = false) => {
      try {
        if (page === 0) setLoading(true);
        else setLoadingMore(true);

        const params: TransactionParams = {
          page,
          size: 10,
        };

        if (sortBy) {
          params.sort = sortBy;
        }

        if (selectedStatus) {
          params.filter = `status:${selectedStatus}`;
        }

        console.log("🔄 Loading transactions with params:", params);
        const response = await transactionApi.getMyTransactions(params);
        console.log("📡 API Response:", response);

        if (response.statusCode === 200 && response.items) {
          const newTransactions = response.items;
          console.log("✅ Setting transactions:", newTransactions);

          // Debug chi tiết từng transaction
          newTransactions.forEach((tx, index) => {
            console.log(`📊 Transaction ${index + 1}:`, {
              id: tx.id,
              type: tx.type,
              status: tx.status,
              amount: tx.amount,
              from: tx.from,
              to: tx.to,
              fromTypeBalance: tx.fromTypeBalance,
              toTypeBalance: tx.toTypeBalance,
              note: tx.note,
              orderType: tx.order?.type,
              createdAt: tx.createdAt,
            });
          });

          setTransactions((prev) =>
            append ? [...prev, ...newTransactions] : newTransactions
          );
          setCurrentPage(response.pageIndex || 0);
          setHasNextPage(response.hasNextPage || false);
          setTotalItems(response.totalItems || 0);
        } else {
          console.log("❌ API Error or no items:", response);
          setTransactions([]);
          setTotalItems(0);
        }
      } catch {
        showMessage("ERM006", "Không thể tải danh sách giao dịch");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setFilterLoading(false);
      }
    },
    [selectedStatus, sortBy] // Remove dependencies to prevent infinite loop
  );

  useEffect(() => {
    console.log("🚀 TransactionsScreen mounted, loading transactions...");
    loadTransactions(0, false);
  }, [loadTransactions]);

  useEffect(() => {
    console.log("🔄 Status or sort changed, reloading transactions...");

    setCurrentPage(0);
    setHasNextPage(false);
    setFilterLoading(true);
    loadTransactions(0, false);
  }, [loadTransactions, selectedStatus, sortBy]);

  useEffect(() => {
    console.log("📊 Transactions state changed:", {
      count: transactions.length,
      total: totalItems,
      loading,
      hasNextPage,
    });
  }, [transactions, totalItems, loading, hasNextPage]);

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
    // Xác định loại transaction dựa trên context
    if (item.order) {
      const orderType = orderTypeLabels[item.order.type] || item.order.type;
      return `${orderType} - ${item.to}`;
    }

    // Sử dụng enum TransactionType để xác định loại giao dịch
    switch (item.type) {
      case TransactionType.DEPOSIT:
        return `Nạp tiền - ${item.to}`;

      case TransactionType.WITHDRAW:
        return `Rút tiền - ${item.to}`;

      case TransactionType.RECEIVE:
        return `Nhận tiền - ${item.from}`;

      case TransactionType.REFUND:
        return `Hoàn tiền - ${item.from}`;

      case TransactionType.TRANSFER:
        // Phân tích TRANSFER type dựa trên balance types và direction
        if (
          item.fromTypeBalance === "AVAILABLE" &&
          item.toTypeBalance === "LOCKED"
        ) {
          return `Đặt cọc đơn hàng - ${item.to}`;
        } else if (
          item.fromTypeBalance === "LOCKED" &&
          item.toTypeBalance === "AVAILABLE"
        ) {
          return `Hoàn tiền đơn hàng - ${item.to}`;
        } else if (
          item.from.includes("_shop_") &&
          item.to.includes("_wallet_")
        ) {
          return `Thanh toán đơn hàng - ${item.to}`;
        } else if (
          item.from.includes("_wallet_") &&
          item.to.includes("_bank_")
        ) {
          return `Yêu cầu rút tiền - ${item.to}`;
        } else if (
          item.from.includes("_bank_") &&
          item.to.includes("_wallet_")
        ) {
          return `Nạp tiền - ${item.to}`;
        } else {
          return `Chuyển khoản - ${item.to}`;
        }

      default:
        return (
          item.note || `${typeLabels[item.type] || item.type} - ${item.to}`
        );
    }
  };

  const getSortDescription = () => {
    switch (sortBy) {
      case "amount:desc":
        return "Sắp xếp theo số tiền (cao → thấp)";
      case "amount:asc":
        return "Sắp xếp theo số tiền (thấp → cao)";
      case "type:asc":
        return "Sắp xếp theo loại giao dịch (Nạp tiền → Rút tiền → Chuyển khoản → Nhận tiền → Hoàn tiền)";
      case "status:asc":
        return "Sắp xếp theo trạng thái (Đang xử lý → Hoàn thành → Thất bại)";
      default:
        return "Sắp xếp theo thời gian (mới nhất trước)";
    }
  };

  const filteredTransactions = transactions
    .filter((item) => {
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
    })
    .sort((a, b) => {
      // Ưu tiên PENDING lên đầu (nếu được bật)
      if (prioritizePending) {
        if (a.status === "PENDING" && b.status !== "PENDING") {
          return -1; // a lên trước
        }
        if (a.status !== "PENDING" && b.status === "PENDING") {
          return 1; // b lên trước
        }
      }

      // Nếu cả hai đều PENDING hoặc không PENDING, áp dụng sort logic
      if (sortBy === "amount:desc") {
        return parseFloat(b.amount) - parseFloat(a.amount);
      } else if (sortBy === "amount:asc") {
        return parseFloat(a.amount) - parseFloat(b.amount);
      } else if (sortBy === "type:asc") {
        // Sort theo transaction type
        const typeOrder: { [key: string]: number } = {
          [TransactionType.DEPOSIT]: 1,
          [TransactionType.WITHDRAW]: 2,
          [TransactionType.TRANSFER]: 3,
          [TransactionType.RECEIVE]: 4,
          [TransactionType.REFUND]: 5,
        };
        const aOrder = typeOrder[a.type] || 999;
        const bOrder = typeOrder[b.type] || 999;
        return aOrder - bOrder;
      } else if (sortBy === "status:asc") {
        // Sort theo status
        const statusOrder: { [key: string]: number } = {
          PENDING: 1,
          COMPLETED: 2,
          FAILED: 3,
        };
        const aOrder = statusOrder[a.status] || 999;
        const bOrder = statusOrder[b.status] || 999;
        return aOrder - bOrder;
      }

      // Mặc định: giữ nguyên thứ tự từ API
      return 0;
    });

  const renderTransaction = ({ item }: { item: TransactionItem }) => {
    const statusColor = statusColors[item.status] || "#6B7280";
    const isOutgoing = item.fromTypeBalance === "AVAILABLE";

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
          <View className="flex-1">
            {item.order ? (
              <Text className="text-xs text-gray-500">
                Đơn hàng: {item.order.id.slice(-8)} • {item.order.address}
              </Text>
            ) : (
              <Text className="text-xs text-gray-500">
                {item.note || `${item.from} → ${item.to}`}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Hoàn thành", value: "COMPLETED" },
    { label: "Đang xử lý", value: "PENDING" },
    { label: "Thất bại", value: "FAILED" },
  ];

  const sortOptions = [
    { label: "Mới nhất", value: "" },
    { label: "Số tiền cao", value: "amount:desc" },
    { label: "Số tiền thấp", value: "amount:asc" },
    { label: "Loại giao dịch", value: "type:asc" },
    { label: "Trạng thái", value: "status:asc" },
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
                  disabled={filterLoading}
                  className={`px-2 py-1 rounded-lg mr-2 mb-1 flex-row items-center ${
                    selectedStatus === option.value
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  } ${filterLoading ? "opacity-50" : ""}`}
                >
                  {filterLoading && selectedStatus === option.value && (
                    <ActivityIndicator
                      size="small"
                      color="#3B82F6"
                      className="mr-1"
                    />
                  )}
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
                  disabled={filterLoading}
                  className={`px-2 py-1 rounded-lg mr-2 mb-1 flex-row items-center ${
                    sortBy === option.value ? "bg-green-100" : "bg-gray-100"
                  } ${filterLoading ? "opacity-50" : ""}`}
                >
                  {filterLoading && sortBy === option.value && (
                    <ActivityIndicator
                      size="small"
                      color="#10B981"
                      className="mr-1"
                    />
                  )}
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

        {/* Sort Description */}
        {sortBy && (
          <View className="mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Text className="text-xs text-blue-700 text-center">
              {getSortDescription()}
            </Text>
          </View>
        )}

        {/* Prioritize PENDING Toggle */}
        <View className="mt-3">
          <TouchableOpacity
            onPress={() => setPrioritizePending(!prioritizePending)}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              prioritizePending ? "bg-yellow-100" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name={prioritizePending ? "star" : "star-outline"}
              size={16}
              color={prioritizePending ? "#F59E0B" : "#6B7280"}
            />
            <Text
              className={`text-xs ml-2 ${
                prioritizePending ? "text-yellow-700" : "text-gray-600"
              }`}
            >
              {prioritizePending
                ? "Đang ưu tiên giao dịch mới"
                : "Ưu tiên giao dịch mới"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-gray-600 mt-2">Đang tải giao dịch...</Text>
        </View>
      ) : filterLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-gray-600 mt-2">Đang lọc giao dịch...</Text>
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
