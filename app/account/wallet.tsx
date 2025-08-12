import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { walletApi } from "../../services/apis/wallet.api";
import { Wallet } from "../../services/types";

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await walletApi.getMyWallet();
      if (response.statusCode === 200) {
        setWallet(response.item);
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const getFullName = () => {
    if (!wallet?.user) return "Người dùng";
    const parts = [wallet.user.firstName, wallet.user.middleName, wallet.user.lastName].filter(Boolean);
    return parts.join(" ");
  };

  const getInitials = () => {
    if (!wallet?.user) return "U";
    const firstName = wallet.user.firstName || "";
    const lastName = wallet.user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">Đang tải thông tin ví...</Text>
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
          <Text className="text-lg font-semibold text-gray-800">Quản lý ví</Text>
          <TouchableOpacity
           
            onPress={() => console.log("Settings")}
          >
            
          </TouchableOpacity>
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
                  <Text className="text-white text-xl font-bold">{getInitials()}</Text>
                </View>
              )}
              {wallet.user.isVerified && (
                <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-800">{getFullName()}</Text>
              <Text className="text-sm text-gray-500">{wallet.user.email}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="text-sm text-gray-600 ml-1">
                  Điểm uy tín: {wallet.user.reputation}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Balance Cards */}
        <View className="mx-4 mt-4">
          {/* Available Balance */}
          <View className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 mb-4 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-medium">Số dư khả dụng</Text>
              <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(wallet.availableBalance)}
            </Text>
            <Text className="text-green-100 text-sm mt-1">
              Có thể sử dụng ngay
            </Text>
          </View>

          {/* Locked Balance */}
          <View className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 mb-4 shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm font-medium">Số dư bị khóa</Text>
              <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-3xl font-bold">
              {formatCurrency(wallet.lockedBalance)}
            </Text>
            <Text className="text-orange-100 text-sm mt-1">
              Đang trong giao dịch
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Thao tác nhanh</Text>
          
          <View className="bg-white rounded-2xl p-4 shadow-soft">
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-primary-500 rounded-xl py-4 items-center"
                onPress={() => router.push("/account/topup")}
              >
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                <Text className="text-white font-semibold mt-2">Nạp tiền</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
                onPress={() => console.log("Rút tiền")}
              >
                <Ionicons name="remove-circle-outline" size={24} color="#FFFFFF" />
                <Text className="text-white font-semibold mt-2">Rút tiền</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-green-500 rounded-xl py-4 items-center"
                onPress={() => console.log("Chuyển tiền")}
              >
                <Ionicons name="swap-horizontal-outline" size={24} color="#FFFFFF" />
                <Text className="text-white font-semibold mt-2">Chuyển tiền</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View className="mx-4 mt-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Lịch sử giao dịch</Text>
            <TouchableOpacity
              className="bg-gray-100 rounded-xl px-4 py-2"
              onPress={() => console.log("Xem tất cả")}
            >
              <Text className="text-gray-600 font-medium">Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white rounded-2xl p-4 shadow-soft">
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 text-center mt-2">
                Chưa có giao dịch nào
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Các giao dịch của bạn sẽ hiển thị ở đây
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 