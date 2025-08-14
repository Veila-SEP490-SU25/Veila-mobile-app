import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useLazyGetDistrictsQuery,
  useLazyGetProvincesQuery,
  useLazyGetWardsQuery,
} from "../../services/apis";
import { IAddress, IDistrict, IProvince, IWard } from "../../services/types";

interface AddressPickerProps {
  value: IAddress;
  onChange: (address: IAddress) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export default function AddressPicker({
  value,
  onChange,
  label,
  placeholder = "Chọn địa chỉ",
  required = false,
}: AddressPickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "province" | "district" | "ward"
  >("province");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProvinces, setAllProvinces] = useState<IProvince[]>([]);
  const [allDistricts, setAllDistricts] = useState<IDistrict[]>([]);
  const [allWards, setAllWards] = useState<IWard[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [getProvinces, { isLoading: isLoadingProvinces }] =
    useLazyGetProvincesQuery();
  const [getDistricts, { isLoading: isLoadingDistricts }] =
    useLazyGetDistrictsQuery();
  const [getWards, { isLoading: isLoadingWards }] = useLazyGetWardsQuery();

  const loadAllProvinces = useCallback(async () => {
    try {
      console.log("Loading provinces...");
      setError(null);
      setIsLoading(true);
      const result = await getProvinces({ page: 0, size: 100 }).unwrap();
      console.log("Provinces loaded:", result);
      if (result.data && result.data.length > 0) {
        setAllProvinces(result.data);
      } else {
        // No provinces found - show empty state instead of error
        setAllProvinces([]);
        setError(null);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
      // Don't show error for empty data, just set empty array
      setAllProvinces([]);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [getProvinces]);

  const loadAllDistricts = useCallback(
    async (provinceId: string) => {
      try {
        setError(null);
        setIsLoading(true);
        const result = await getDistricts({
          provinceId,
          page: 0,
          size: 100,
        }).unwrap();
        console.log("Districts loaded:", result);
        if (result.data && result.data.length > 0) {
          setAllDistricts(result.data);
        } else {
          // No districts found - show empty state instead of error
          setAllDistricts([]);
          setError(null);
        }
      } catch (error) {
        console.error("Error loading districts:", error);
        // Don't show error for empty data, just set empty array
        setAllDistricts([]);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getDistricts]
  );

  const loadAllWards = useCallback(
    async (districtId: string) => {
      try {
        setError(null);
        setIsLoading(true);
        const result = await getWards({
          districtId,
          page: 0,
          size: 100,
        }).unwrap();
        console.log("Wards loaded:", result);
        if (result.data && result.data.length > 0) {
          setAllWards(result.data);
        } else {
          // No wards found - show empty state instead of error
          setAllWards([]);
          setError(null);
        }
      } catch (error) {
        console.error("Error loading wards:", error);
        // Don't show error for empty data, just set empty array
        setError(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getWards]
  );

  // Load provinces when modal opens
  useEffect(() => {
    if (showModal && !isInitialized) {
      loadAllProvinces();
      setIsInitialized(true);
    }
  }, [showModal, isInitialized, loadAllProvinces]);

  // Load districts when province is selected
  useEffect(() => {
    if (
      currentStep === "district" &&
      value.province &&
      allDistricts.length === 0
    ) {
      loadAllDistricts(value.province.id);
    }
  }, [currentStep, value.province, allDistricts.length, loadAllDistricts]);

  // Load wards when district is selected
  useEffect(() => {
    if (currentStep === "ward" && value.district && allWards.length === 0) {
      loadAllWards(value.district.id);
    }
  }, [currentStep, value.district, allWards.length, loadAllWards]);

  const handleProvinceSelect = (province: IProvince) => {
    onChange({
      ...value,
      province,
      district: null,
      ward: null,
    });
    setCurrentStep("district");
    setSearchQuery("");
    setAllDistricts([]); // Reset districts when new province is selected
    setAllWards([]); // Reset wards
  };

  const handleDistrictSelect = (district: IDistrict) => {
    onChange({
      ...value,
      district,
      ward: null,
    });
    setCurrentStep("ward");
    setSearchQuery("");
    setAllWards([]); // Reset wards when new district is selected
  };

  const handleWardSelect = (ward: IWard) => {
    onChange({
      ...value,
      ward,
    });
    setShowModal(false);
    setCurrentStep("province");
    setSearchQuery("");
  };

  const getDisplayText = () => {
    if (!value.province) return placeholder;

    let text = value.province.name;
    if (value.district) {
      text += `, ${value.district.name}`;
    }
    if (value.ward) {
      text += `, ${value.ward.name}`;
    }
    return text;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "province":
        return "Chọn Tỉnh/Thành";
      case "district":
        return `Chọn Quận/Huyện - ${value.province?.name}`;
      case "ward":
        return `Chọn Phường/Xã - ${value.district?.name}`;
      default:
        return "";
    }
  };

  const getFilteredData = () => {
    let data: (IProvince | IDistrict | IWard)[] = [];

    switch (currentStep) {
      case "province":
        data = allProvinces;
        break;
      case "district":
        data = allDistricts;
        break;
      case "ward":
        data = allWards;
        break;
    }

    if (searchQuery.trim()) {
      return data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  };

  const getIsLoading = () => {
    return (
      isLoading || isLoadingProvinces || isLoadingDistricts || isLoadingWards
    );
  };

  const renderItem = ({ item }: { item: IProvince | IDistrict | IWard }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (currentStep === "province") {
          handleProvinceSelect(item as IProvince);
        } else if (currentStep === "district") {
          handleDistrictSelect(item as IDistrict);
        } else if (currentStep === "ward") {
          handleWardSelect(item as IWard);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemType}>{item.typeText}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
    </TouchableOpacity>
  );

  const renderBreadcrumb = () => (
    <View style={styles.breadcrumb}>
      <TouchableOpacity
        style={[
          styles.breadcrumbItem,
          currentStep === "province" && styles.activeBreadcrumb,
        ]}
        onPress={() => {
          setCurrentStep("province");
          setSearchQuery("");
        }}
      >
        <Text
          style={[
            styles.breadcrumbText,
            currentStep === "province" && styles.activeBreadcrumbText,
          ]}
        >
          Tỉnh/Thành
        </Text>
      </TouchableOpacity>

      {value.province && (
        <>
          <Ionicons name="chevron-forward" size={12} color="#CCCCCC" />
          <TouchableOpacity
            style={[
              styles.breadcrumbItem,
              currentStep === "district" && styles.activeBreadcrumb,
            ]}
            onPress={() => {
              setCurrentStep("district");
              setSearchQuery("");
            }}
          >
            <Text
              style={[
                styles.breadcrumbText,
                currentStep === "district" && styles.activeBreadcrumbText,
              ]}
            >
              {value.province.name}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {value.district && (
        <>
          <Ionicons name="chevron-forward" size={12} color="#CCCCCC" />
          <TouchableOpacity
            style={[
              styles.breadcrumbItem,
              currentStep === "ward" && styles.activeBreadcrumb,
            ]}
            onPress={() => {
              setCurrentStep("ward");
              setSearchQuery("");
            }}
          >
            <Text
              style={[
                styles.breadcrumbText,
                currentStep === "ward" && styles.activeBreadcrumbText,
              ]}
            >
              {value.district.name}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          if (currentStep === "province") {
            loadAllProvinces();
          } else if (currentStep === "district") {
            loadAllDistricts(value.province!.id);
          } else if (currentStep === "ward") {
            loadAllWards(value.district!.id);
          }
        }}
      >
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    if (getIsLoading()) {
      return null; // Don't show empty state while loading
    }

    let message = "Không có dữ liệu để hiển thị";
    let subMessage = "";

    if (searchQuery) {
      message = "Không tìm thấy kết quả phù hợp";
      subMessage = "Vui lòng thử từ khóa khác";
    } else {
      switch (currentStep) {
        case "province":
          message = "Không có dữ liệu tỉnh/thành";
          subMessage = "Vui lòng thử lại sau";
          break;
        case "district":
          message = "Không có dữ liệu quận/huyện cho tỉnh này";
          subMessage = "Vui lòng chọn tỉnh khác";
          break;
        case "ward":
          message = "Không có dữ liệu phường/xã cho quận này";
          subMessage = "Vui lòng chọn quận khác";
          break;
      }
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyText}>{message}</Text>
        {subMessage && <Text style={styles.emptySubText}>{subMessage}</Text>}
        {searchQuery && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery("")}
          >
            <Text style={styles.clearSearchButtonText}>Xóa tìm kiếm</Text>
          </TouchableOpacity>
        )}
        {!searchQuery && currentStep === "province" && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAllProvinces}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
        <TouchableOpacity
          style={[
            styles.picker,
            value.province && styles.pickerFilled,
            !value.province && styles.pickerEmpty,
          ]}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.pickerText,
              !value.province && styles.placeholderText,
            ]}
          >
            {getDisplayText()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={value.province ? "#10B981" : "#999999"}
          />
        </TouchableOpacity>
        {value.province && (
          <View style={styles.completionIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.completionText}>Đã chọn địa chỉ</Text>
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                if (currentStep === "province") {
                  setShowModal(false);
                } else if (currentStep === "district") {
                  setCurrentStep("province");
                } else if (currentStep === "ward") {
                  setCurrentStep("district");
                }
                setSearchQuery("");
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{getStepTitle()}</Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          {renderBreadcrumb()}

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#999999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#999999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {getIsLoading() ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E05C78" />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredData()}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState()}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  required: {
    fontSize: 14,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 4,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  pickerEmpty: {
    borderColor: "#E5E7EB",
  },
  pickerFilled: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  pickerText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "#999999",
  },
  completionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  completionText: {
    fontSize: 12,
    color: "#10B981",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 55,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  breadcrumbItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBreadcrumb: {
    backgroundColor: "#E05C78",
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  activeBreadcrumbText: {
    color: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
  },
  clearButton: {
    marginLeft: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    color: "#666666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginBottom: 16,
  },
  emptySubText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: "#E05C78",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#E05C78",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
