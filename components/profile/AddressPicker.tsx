import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
}

export default function AddressPicker({
  value,
  onChange,
  label,
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

  const [getProvinces, { isLoading: isLoadingProvinces }] =
    useLazyGetProvincesQuery();
  const [getDistricts, { isLoading: isLoadingDistricts }] =
    useLazyGetDistrictsQuery();
  const [getWards, { isLoading: isLoadingWards }] = useLazyGetWardsQuery();

  const loadAllProvinces = useCallback(async () => {
    try {
      console.log("Loading provinces...");
      setError(null);
      const result = await getProvinces({ page: 0, size: 100 }).unwrap();
      console.log("Provinces loaded:", result);
      setAllProvinces(result.data || []);
    } catch (error) {
      console.error("Error loading provinces:", error);
      setError("Không thể tải danh sách tỉnh/thành");
      Alert.alert(
        "Lỗi",
        "Không thể tải danh sách tỉnh/thành. Vui lòng thử lại."
      );
    }
  }, [getProvinces]);

  const loadAllDistricts = useCallback(
    async (provinceId: string) => {
      try {
        setError(null);
        const result = await getDistricts({
          provinceId,
          page: 0,
          size: 100,
        }).unwrap();
        console.log("Districts loaded:", result);
        setAllDistricts(result.data || []);
      } catch (error) {
        console.error("Error loading districts:", error);
        setError("Không thể tải danh sách quận/huyện");
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách quận/huyện. Vui lòng thử lại."
        );
      }
    },
    [getDistricts]
  );

  const loadAllWards = useCallback(
    async (districtId: string) => {
      try {
        setError(null);
        const result = await getWards({
          districtId,
          page: 0,
          size: 100,
        }).unwrap();
        console.log("Wards loaded:", result);
        setAllWards(result.data || []);
      } catch (error) {
        console.error("Error loading wards:", error);
        setError("Không thể tải danh sách phường/xã");
        Alert.alert(
          "Lỗi",
          "Không thể tải danh sách phường/xã. Vui lòng thử lại."
        );
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
    if (!value.province) return "Chọn địa chỉ";

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
        return "Chọn Quận/Huyện";
      case "ward":
        return "Chọn Phường/Xã";
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
    switch (currentStep) {
      case "province":
        return isLoadingProvinces;
      case "district":
        return isLoadingDistricts;
      case "ward":
        return isLoadingWards;
      default:
        return false;
    }
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
    >
      <Text style={styles.itemText}>{item.name}</Text>
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

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.picker}
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
          <Ionicons name="chevron-down" size={16} color="#999999" />
        </TouchableOpacity>
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

          {error ? (
            renderErrorState()
          ) : getIsLoading() ? (
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
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Không tìm thấy kết quả"
                      : "Không có dữ liệu"}
                  </Text>
                </View>
              }
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
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  pickerText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  placeholderText: {
    color: "#999999",
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  itemText: {
    fontSize: 16,
    color: "#333333",
    flex: 1,
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
