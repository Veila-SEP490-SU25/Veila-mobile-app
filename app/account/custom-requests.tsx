import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { customRequestApi } from "../../services/apis/custom-request.api";
import { CustomRequest } from "../../services/types";

const STATUS_COLORS = {
  DRAFT: "#6B7280",
  PENDING: "#F59E0B",
  APPROVED: "#10B981",
  REJECTED: "#EF4444",
  IN_PROGRESS: "#3B82F6",
  COMPLETED: "#8B5CF6",
};

const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
};

export default function CustomRequestsScreen() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadRequests = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(0);
      }

      const currentPage = refresh ? 0 : page;
      const response = await customRequestApi.getMyRequests(currentPage, 10);

      if (response.statusCode === 200) {
        if (refresh) {
          setRequests(response.items);
        } else {
          setRequests((prev) => [...prev, ...response.items]);
        }
        setHasNextPage(response.hasNextPage);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests(true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests(true);
  };

  const loadMore = () => {
    if (hasNextPage && !loading) {
      setPage((prev) => prev + 1);
      loadRequests();
    }
  };

  const handleDeleteRequest = (id: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa yêu cầu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await customRequestApi.deleteRequest(id);
            setRequests((prev) => prev.filter((req) => req.id !== id));
            Alert.alert("Thành công", "Đã xóa yêu cầu");
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa yêu cầu");
          }
        },
      },
    ]);
  };

  const renderRequest = ({ item }: { item: CustomRequest }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 shadow-soft overflow-hidden"
      onPress={() => router.push(`/account/custom-requests/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <Text
            className="text-lg font-semibold text-gray-800 flex-1 mr-3"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View
            className={`px-3 py-1 rounded-full`}
            style={{ backgroundColor: `${STATUS_COLORS[item.status]}15` }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: STATUS_COLORS[item.status] }}
            >
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-500 ml-1">
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="eye-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-500 ml-1">
              {item.isPrivate ? "Riêng tư" : "Công khai"}
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="flex-1 bg-primary-500 rounded-xl py-2 items-center"
            onPress={() =>
              router.push(`/account/custom-requests/${item.id}` as any)
            }
          >
            <Text className="text-white font-medium text-sm">Xem chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 rounded-xl py-2 px-4 items-center"
            onPress={() => handleDeleteRequest(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
      <Text className="text-xl font-semibold text-gray-400 mt-4 text-center">
        Chưa có yêu cầu nào
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        Tạo yêu cầu đầu tiên để bắt đầu thiết kế váy cưới
      </Text>
      <TouchableOpacity
        className="bg-primary-500 rounded-xl py-3 px-6 mt-6"
        onPress={() => router.push("/account/custom-requests/create" as any)}
      >
        <Text className="text-white font-semibold">Tạo yêu cầu mới</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && requests.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E05C78" />
          <Text className="text-lg text-gray-600 mt-4">
            Đang tải yêu cầu...
          </Text>
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
            Yêu cầu đặt may
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center"
            onPress={() =>
              router.push("/account/custom-requests/create" as any)
            }
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {requests.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            hasNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#E05C78" />
                <Text className="text-gray-500 mt-2">Đang tải thêm...</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
