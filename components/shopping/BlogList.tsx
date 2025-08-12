import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";
import { useGetBlogsQuery } from "../../services/apis/blog.api";
import { BlogPost } from "../../services/types";

interface BlogListProps {
  onBlogPress: (blog: BlogPost) => void;
}

interface FilterOptions {
  title?: string;
  sort?: string;
  size: number;
  page: number;
}

export default function BlogList({ onBlogPress }: BlogListProps) {
  const [page, setPage] = useState(0);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("title:asc");
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    title: "",
    sort: "title:asc",
    size: 10,
    page: 0,
  });

  // Gọi API với page, size = 10, sort, filter
  const { data, isLoading, isFetching, refetch, error } = useGetBlogsQuery({
    page,
    size: filterOptions.size,
    sort: filterOptions.sort,
    filter: debouncedSearchQuery
      ? `title:like:${debouncedSearchQuery}`
      : undefined,
  });

  // Debounce nhập tìm kiếm 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setFilterOptions(prev => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Khi sortBy thay đổi, reset page về 0 luôn
  useEffect(() => {
    setFilterOptions(prev => ({ ...prev, page: 0 }));
  }, [filterOptions.sort]);

  // Khi data thay đổi, update danh sách blogs
  useEffect(() => {
    if (data?.items) {
      if (page === 0) {
        setBlogs(data.items); // trang đầu thì reset list
      } else {
        // Trang tiếp theo thì gộp list tránh trùng
        setBlogs((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const newItems = data.items.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  // Refresh lại danh sách
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFilterOptions(prev => ({ ...prev, page: 0 })); // reset về trang đầu
    refetch().finally(() => setRefreshing(false)); // tắt refreshing sau khi load xong
  }, [refetch]);

  // Load thêm trang kế tiếp khi scroll đến cuối
  const loadMore = useCallback(() => {
    if (data?.hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasNextPage, isFetching]);

  // Các hàm xử lý sự kiện
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSort = useCallback((sort: string) => {
    setFilterOptions(prev => ({ ...prev, sort, page: 0 }));
    setShowFilters(false);
  }, []);

  const handleSizeChange = useCallback((size: number) => {
    setFilterOptions(prev => ({ ...prev, size, page: 0 }));
    setShowFilters(false);
  }, []);

  const handleShopPress = useCallback((shopId: string) => {
    router.push(`/shop/${shopId}`);
  }, []);

  // Render từng blog item
  const renderBlog = useCallback(
    ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
        style={styles.blogCard}
      onPress={() => onBlogPress(item)}
      activeOpacity={0.85}
    >
        <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.images && item.images.length > 0
                ? item.images[0]
                : "https://placehold.co/600x300?text=Blog",
          }}
            style={styles.blogImage}
          resizeMode="cover"
        />
      </View>
        <View style={styles.blogContent}>
          <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>

          {/* Shop Info */}
          <TouchableOpacity
            style={styles.shopInfo}
            onPress={() => handleShopPress(item.user.shop.id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.user.shop.logoUrl }}
              style={styles.shopLogo}
              resizeMode="cover"
            />
            <View style={styles.shopDetails}>
              <Text style={styles.shopName}>
                {item.user.shop.name}
              </Text>
              <Text style={styles.shopAddress} numberOfLines={1}>
                {item.user.shop.address}
              </Text>
            </View>
            <View style={styles.reputationContainer}>
              <Text style={styles.reputationLabel}>
                Điểm uy tín:
              </Text>
              <Text style={styles.reputationValue}>
                {item.user.shop.reputation}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Summary */}
        {item.summary ? (
            <Text style={styles.blogSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        ) : null}

          {/* Meta Info */}
          <View style={styles.metaInfo}>
            <View style={styles.categoryContainer}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#E05C78"
              />
              <Text style={styles.categoryText}>
                {item.category.name}
              </Text>
            </View>
            {item.publishedAt && (
              <Text style={styles.publishDate}>
                {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [onBlogPress, handleShopPress]
  );

  // Header gồm thanh tìm kiếm và chọn sort
  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Search and Filter Header */}
        <View style={styles.searchFilterHeader}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bài viết..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => handleSearch("")}
              >
                <Ionicons name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#E05C78" />
            <Text style={styles.filterButtonText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {blogs.length} bài viết
            {searchQuery && ` cho "${searchQuery}"`}
          </Text>
          {searchQuery !== debouncedSearchQuery && (
            <View style={styles.searchingIndicator}>
              <ActivityIndicator size="small" color="#E05C78" />
              <Text style={styles.searchingText}>Đang tìm kiếm...</Text>
            </View>
          )}
        </View>
      </View>
    ),
    [searchQuery, debouncedSearchQuery, blogs.length, handleSearch]
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>
          Có lỗi xảy ra
        </Text>
        <Text style={styles.errorMessage}>
          Không thể tải danh sách bài viết. Vui lòng thử lại.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && blogs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E05C78" />
        <Text style={styles.loadingText}>
          Đang tải bài viết...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
    <FlatList
      data={blogs}
      renderItem={renderBlog}
      keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
        ListHeaderComponent={renderHeader}
      ListFooterComponent={
        data?.hasNextPage ? (
            <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#E05C78" />
              <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
            </View>
          ) : blogs.length > 0 ? (
            <View style={styles.resultsSummary}>
              <Text style={styles.resultsSummaryText}>
                Hiển thị {blogs.length} / {data?.totalItems || 0} bài viết
              </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !isLoading ? (
            <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>
              Không có bài viết nào
            </Text>
              <Text style={styles.emptyMessage}>
                {debouncedSearchQuery
                  ? "Không tìm thấy bài viết phù hợp với từ khóa tìm kiếm"
                  : "Hãy quay lại sau để xem bài viết mới"}
            </Text>
          </View>
        ) : null
      }
    />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filterOptions.sort === "title:asc" && styles.activeSortOption
                  ]}
                  onPress={() => handleSort("title:asc")}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filterOptions.sort === "title:asc" && styles.activeSortOptionText
                  ]}>
                    Tên A-Z
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filterOptions.sort === "title:desc" && styles.activeSortOption
                  ]}
                  onPress={() => handleSort("title:desc")}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filterOptions.sort === "title:desc" && styles.activeSortOptionText
                  ]}>
                    Tên Z-A
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    filterOptions.sort === "publishedAt:desc" && styles.activeSortOption
                  ]}
                  onPress={() => handleSort("publishedAt:desc")}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filterOptions.sort === "publishedAt:desc" && styles.activeSortOptionText
                  ]}>
                    Mới nhất
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Size Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Số lượng mỗi trang</Text>
              <View style={styles.sizeOptions}>
                {[5, 10, 15, 20].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      filterOptions.size === size && styles.activeSizeOption
                    ]}
                    onPress={() => handleSizeChange(size)}
                  >
                    <Text style={[
                      styles.sizeOptionText,
                      filterOptions.size === size && styles.activeSizeOptionText
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1, // Allow search input to take available space
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#E05C78",
    marginLeft: 5,
  },
  sortContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  sortChipActive: {
    borderColor: "#E05C78",
    backgroundColor: "#FFF5F7",
  },
  sortChipText: {
    fontSize: 12,
    color: "#666666",
  },
  sortChipTextActive: {
    color: "#E05C78",
    fontWeight: "bold",
  },
  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#666666",
  },
  searchingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchingText: {
    fontSize: 12,
    color: "#E05C78",
    marginLeft: 4,
  },
  blogCard: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2 / 1,
    backgroundColor: "#F0F0F0",
  },
  blogImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  shopLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#333333",
  },
  shopAddress: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  reputationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  reputationLabel: {
    fontSize: 12,
    color: "#E05C78",
    marginRight: 5,
  },
  reputationValue: {
    fontSize: 12,
    color: "#666666",
  },
  blogSummary: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryText: {
    fontSize: 12,
    color: "#E05C78",
    fontWeight: "semibold",
    marginLeft: 5,
  },
  publishDate: {
    fontSize: 12,
    color: "#999999",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#E05C78",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#E05C78",
    marginTop: 10,
  },
  loadingMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
  },
  loadingMoreText: {
    fontSize: 12,
    color: "#E05C78",
    marginLeft: 5,
  },
  resultsSummary: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
  },
  resultsSummaryText: {
    fontSize: 12,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#CCCCCC",
    marginTop: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  closeButton: {
    padding: 5,
  },
  filterSection: {
    width: "100%",
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  sortOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 5,
  },
  sortOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeSortOption: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  activeSortOptionText: {
    color: "#FFFFFF",
  },
  sizeOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 5,
  },
  sizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeSizeOption: {
    backgroundColor: "#E05C78",
    borderColor: "#E05C78",
    borderWidth: 1,
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  activeSizeOptionText: {
    color: "#FFFFFF",
  },
  applyButton: {
    backgroundColor: "#E05C78",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
