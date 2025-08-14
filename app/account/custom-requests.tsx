import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { customRequestApi } from "../../services/apis/custom-request.api";
import { CustomRequest } from "../../services/types";

const STATUS_COLORS = {
  DRAFT: "#6B7280",
  SUBMIT: "#3B82F6",
};

const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  SUBMIT: "Đã đăng",
};

type FilterType = "ALL" | "PRIVATE" | "PUBLIC";
type StatusFilterType = "ALL" | "DRAFT" | "SUBMIT";

export default function CustomRequestsScreen() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterType>("ALL");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRequests = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setPage(0);
        }

        const currentPage = refresh ? 0 : page;

        // Build filter string
        let filterString = "";
        const filters = [];

        if (debouncedSearchQuery.trim()) {
          filters.push(`title:like:${debouncedSearchQuery.trim()}`);
        }

        if (selectedFilter === "PRIVATE") {
          filters.push("isPrivate:eq:true");
        } else if (selectedFilter === "PUBLIC") {
          filters.push("isPrivate:eq:false");
        }

        if (selectedStatus !== "ALL") {
          filters.push(`status:eq:${selectedStatus}`);
        }

        if (filters.length > 0) {
          filterString = filters.join(",");
        }

        const response = await customRequestApi.getMyRequests(
          currentPage,
          10,
          filterString,
          "createdAt:desc"
        );
        console.log("API Response:", response);

        if (response.statusCode === 200 || response.statusCode === 201) {
          let filteredItems = response.items;

          // Client-side filtering for privacy if API doesn't support it
          if (selectedFilter === "PRIVATE") {
            filteredItems = response.items.filter(
              (item) => item.isPrivate === true
            );
          } else if (selectedFilter === "PUBLIC") {
            filteredItems = response.items.filter(
              (item) => item.isPrivate === false
            );
          }

          console.log("Filtered items:", {
            total: response.items.length,
            filtered: filteredItems.length,
            privacyFilter: selectedFilter,
          });

          if (refresh) {
            setRequests(filteredItems);
          } else {
            setRequests((prev) => [...prev, ...filteredItems]);
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
    },
    [page, debouncedSearchQuery, selectedFilter, selectedStatus]
  );

  useEffect(() => {
    loadRequests(true);
  }, [debouncedSearchQuery, selectedFilter, selectedStatus, loadRequests]);

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
    Toast.show({
      type: "info",
      text1: "Xác nhận xóa",
      text2: "Bạn có chắc chắn muốn xóa yêu cầu này?",
      onPress: () => {
        // Show confirmation dialog
        Toast.show({
          type: "info",
          text1: "Xác nhận",
          text2: "Nhấn lại để xác nhận xóa",
          onPress: () => deleteRequest(id),
        });
      },
    });
  };

  const deleteRequest = async (id: string) => {
    try {
      await customRequestApi.deleteRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã xóa yêu cầu",
      });
    } catch (error) {
      console.error("Error deleting request:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể xóa yêu cầu",
      });
    }
  };

  const renderFilterTabs = () => (
    <View className="bg-white rounded-2xl mx-4 mb-4 shadow-soft">
      <View className="flex-row p-1">
        {[
          { key: "ALL", label: "Tất cả", icon: "grid-outline" },
          { key: "PRIVATE", label: "Riêng tư", icon: "lock-closed-outline" },
          { key: "PUBLIC", label: "Công khai", icon: "globe-outline" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl ${
              selectedFilter === filter.key
                ? "bg-primary-500"
                : "bg-transparent"
            }`}
            onPress={() => setSelectedFilter(filter.key as FilterType)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.key ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              className={`ml-2 text-sm font-medium ${
                selectedFilter === filter.key ? "text-white" : "text-gray-600"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStatusFilter = () => (
    <View className="bg-white rounded-2xl mx-4 mb-4 shadow-soft">
      <View className="p-4">
        <Text className="text-base font-semibold text-gray-800 mb-3">
          Trạng thái
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "DRAFT", label: "Bản nháp" },
            { key: "SUBMIT", label: "Đã đăng" },
          ].map((status) => (
            <TouchableOpacity
              key={status.key}
              className={`px-3 py-2 rounded-full border ${
                selectedStatus === status.key
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-gray-50"
              }`}
              onPress={() => setSelectedStatus(status.key as StatusFilterType)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedStatus === status.key
                    ? "text-primary-600"
                    : "text-gray-600"
                }`}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

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

        {/* Measurements Preview */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-xs font-medium text-gray-700 mb-2">
            Kích thước:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Text className="text-xs text-gray-600">Cao: {item.height}cm</Text>
            <Text className="text-xs text-gray-600">
              Cân nặng: {item.weight}kg
            </Text>
            <Text className="text-xs text-gray-600">Ngực: {item.bust}cm</Text>
            <Text className="text-xs text-gray-600">Eo: {item.waist}cm</Text>
            <Text className="text-xs text-gray-600">Hông: {item.hip}cm</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-500 ml-1">
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name={item.isPrivate ? "lock-closed" : "globe"}
              size={16}
              color={item.isPrivate ? "#EF4444" : "#10B981"}
            />
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
        {searchQuery || selectedFilter !== "ALL" || selectedStatus !== "ALL"
          ? "Không tìm thấy yêu cầu phù hợp"
          : "Chưa có yêu cầu nào"}
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        {searchQuery || selectedFilter !== "ALL" || selectedStatus !== "ALL"
          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
          : "Tạo yêu cầu đầu tiên để bắt đầu thiết kế váy cưới"}
      </Text>
      {!searchQuery && selectedFilter === "ALL" && selectedStatus === "ALL" && (
        <TouchableOpacity
          className="bg-primary-500 rounded-xl py-3 px-6 mt-6"
          onPress={() => router.push("/account/custom-requests/create" as any)}
        >
          <Text className="text-white font-semibold">Tạo yêu cầu mới</Text>
        </TouchableOpacity>
      )}
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

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Tìm kiếm yêu cầu..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Status Filter */}
      {renderStatusFilter()}

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
      <Toast />
    </SafeAreaView>
  );
}
