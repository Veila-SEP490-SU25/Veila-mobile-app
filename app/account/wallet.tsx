import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../../providers/auth.provider";
import {
  transactionApi,
  TransactionItem,
} from "../../services/apis/transaction.api";
import { walletApi } from "../../services/apis/wallet.api";
import { Wallet } from "../../services/types";

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await walletApi.getMyWallet();
      if (response.statusCode === 200) {
        setWallet(response.item);
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin ví",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionApi.getMyTransactions({
        page: 0,
        size: 3,
        sort: "createdAt:desc",
      });
      if (response.statusCode === 200) {
        setRecentTransactions(response.items);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  useEffect(() => {
    loadWallet();
    loadRecentTransactions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadWallet(), loadRecentTransactions()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const getFullName = () => {
    if (!wallet?.user) return "Người dùng";
    const parts = [
      wallet.user.firstName,
      wallet.user.middleName,
      wallet.user.lastName,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const getInitials = () => {
    if (!wallet?.user) return "U";
    const firstName = wallet.user.firstName || "";
    const lastName = wallet.user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPhoneVerificationStatus = () => {
    if (!user?.phone)
      return { label: "Chưa có SĐT", color: "#EF4444", icon: "close-circle" };
    if (user?.isIdentified)
      return {
        label: "Đã xác thực",
        color: "#10B981",
        icon: "checkmark-circle",
      };
    return { label: "Chưa xác thực", color: "#F59E0B", icon: "alert-circle" };
  };

  const handleTopup = () => {
    if (!user?.isIdentified) {
      Toast.show({
        type: "warning",
        text1: "Cần xác thực số điện thoại",
        text2: "Vui lòng xác thực số điện thoại trước khi nạp tiền",
      });
      return;
    }
    router.push("/account/topup");
  };

  const handleWithdraw = () => {
    if (!user?.isIdentified) {
      Toast.show({
        type: "warning",
        text1: "Cần xác thực số điện thoại",
        text2: "Vui lòng xác thực số điện thoại trước khi rút tiền",
      });
      return;
    }
    Toast.show({ type: "info", text1: "Tính năng đang phát triển" });
  };

  const getTransactionDescription = (item: TransactionItem) => {
    if (item.order) {
      const orderTypeLabels: { [key: string]: string } = {
        SELL: "Mua váy",
        RENT: "Thuê váy",
        CUSTOM: "Đặt may",
      };
      const orderType = orderTypeLabels[item.order.type] || item.order.type;
      return `${orderType} - ${item.to}`;
    }
    return item.note || `Chuyển khoản - ${item.to}`;
  };

  const renderRecentTransaction = (item: TransactionItem) => {
    const isOutgoing = item.fromTypeBalance === "available";
    const statusColors: { [key: string]: string } = {
      completed: "#10B981",
      pending: "#F59E0B",
      failed: "#EF4444",
    };
    const statusColor = statusColors[item.status] || "#6B7280";

    return (
      <View
        key={item.id}
        className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
      >
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3`}
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <Ionicons
            name={isOutgoing ? "arrow-up" : "arrow-down"}
            size={16}
            color={statusColor}
          />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900 text-sm" numberOfLines={1}>
            {getTransactionDescription(item)}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </Text>
        </View>
        <Text
          className={`font-bold text-sm ${isOutgoing ? "text-red-600" : "text-green-600"}`}
        >
          {isOutgoing ? "-" : "+"} {formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  const phoneStatus = getPhoneVerificationStatus();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">
            Đang tải thông tin ví...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!wallet) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="wallet-outline" size={80} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
            Không thể tải thông tin ví
          </Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 px-6 mt-4"
            onPress={loadWallet}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Quản lý ví
          </Text>
          <TouchableOpacity
            onPress={() => console.log("Settings")}
          ></TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Profile Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-soft">
          <View className="flex-row items-center mb-4">
            <View className="relative">
              {wallet.user.avatarUrl ? (
                <Image
                  source={{ uri: wallet.user.avatarUrl }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {getInitials()}
                  </Text>
                </View>
              )}
              {wallet.user.isVerified && (
                <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {getFullName()}
              </Text>
              <Text className="text-sm text-gray-500">{wallet.user.email}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons
                  name={phoneStatus.icon as any}
                  size={16}
                  color={phoneStatus.color}
                />
                <Text className="text-sm text-gray-600 ml-1">
                  Số điện thoại:{" "}
                  <Text style={{ color: phoneStatus.color }}>
                    {phoneStatus.label}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Info */}
        {(wallet.bin || wallet.bankNumber) && (
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-soft">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Thông tin ngân hàng
            </Text>
            {wallet.bin && (
              <Text className="text-sm text-gray-600">BIN: {wallet.bin}</Text>
            )}
            {wallet.bankNumber && (
              <Text className="text-sm text-gray-600">
                Số tài khoản: {wallet.bankNumber}
              </Text>
            )}
          </View>
        )}

        {/* Balance Cards */}
        <View className="mx-4 mt-4">
          {/* Available Balance */}
          <View style={styles.availableBalanceCard}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-medium">
                Số dư khả dụng
              </Text>
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(wallet.availableBalance)}
            </Text>
            <Text style={styles.availableBalanceSubtext}>
              Có thể sử dụng ngay
            </Text>
          </View>

          {/* Locked Balance */}
          <View style={styles.lockedBalanceCard}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-medium">
                Số dư bị khóa
              </Text>
              <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(wallet.lockedBalance)}
            </Text>
            <Text style={styles.lockedBalanceSubtext}>
              Đang trong giao dịch
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Thao tác nhanh
          </Text>

          <View className="bg-white rounded-2xl p-4 shadow-soft">
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
                onPress={handleTopup}
              >
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                <Text className="text-white font-semibold mt-2">Nạp tiền</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
                onPress={handleWithdraw}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={24}
                  color="#FFFFFF"
                />
                <Text className="text-white font-semibold mt-2">
                  Yêu cầu rút tiền
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View className="mx-4 mt-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Giao dịch gần đây
            </Text>
            <TouchableOpacity
              className="bg-gray-100 rounded-xl px-4 py-2"
              onPress={() => router.push("/account/transactions")}
            >
              <Text className="text-gray-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-soft">
            {recentTransactions.length > 0 ? (
              <View>{recentTransactions.map(renderRecentTransaction)}</View>
            ) : (
              <View className="items-center py-8">
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text className="text-gray-400 text-center mt-2">
                  Chưa có giao dịch nào
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  Các giao dịch của bạn sẽ hiển thị ở đây
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  availableBalanceCard: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  availableBalanceSubtext: {
    color: "#D1FAE5",
    fontSize: 14,
    marginTop: 4,
  },
  lockedBalanceCard: {
    backgroundColor: "#F59E0B",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedBalanceSubtext: {
    color: "#FEF3C7",
    fontSize: 14,
    marginTop: 4,
  },
});
