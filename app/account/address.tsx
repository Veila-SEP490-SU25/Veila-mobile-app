import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AddressDisplay from "../../components/profile/AddressDisplay";
import AddressPicker from "../../components/profile/AddressPicker";
import { useAuth } from "../../providers/auth.provider";
import { IAddress } from "../../services/types";
import {
  createProfileUpdateFromAddress,
  parseAddressString,
} from "../../utils/address.util";

interface Address {
  id: string;
  name: string;
  phone: string;
  streetAddress: string;
  province: any;
  district: any;
  ward: any;
  isDefault: boolean;
}

const AddressScreen = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    streetAddress: "",
    address: {
      province: null,
      district: null,
      ward: null,
      streetAddress: "",
    } as IAddress,
  });

  useEffect(() => {
    // Initialize with user data
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Nguyễn Văn A",
        phone: user.phone || "0901234567",
      }));
    }

    // Load existing addresses from user data
    loadAddresses();
  }, [user]);

  const loadAddresses = () => {
    if (!user) return;

    // Parse user's address if it exists
    const userAddress = user.address;
    if (userAddress) {
      // Parse the address string using utility function
      const parsedAddress = parseAddressString(userAddress);

      if (parsedAddress.province) {
        const existingAddress: Address = {
          id: "1",
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Nguyễn Văn A",
          phone: user.phone || "0901234567",
          streetAddress: parsedAddress.streetAddress,
          province: {
            id: "unknown",
            name: parsedAddress.province,
            typeText: "Tỉnh/Thành",
          },
          district: parsedAddress.district
            ? {
                id: "unknown",
                name: parsedAddress.district,
                typeText: "Quận/Huyện",
              }
            : null,
          ward: parsedAddress.ward
            ? {
                id: "unknown",
                name: parsedAddress.ward,
                typeText: "Phường/Xã",
              }
            : null,
          isDefault: true,
        };

        setAddresses([existingAddress]);
      } else {
        // If address format is not as expected, create a simple address
        const existingAddress: Address = {
          id: "1",
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Nguyễn Văn A",
          phone: user.phone || "0901234567",
          streetAddress: userAddress,
          province: null,
          district: null,
          ward: null,
          isDefault: true,
        };

        setAddresses([existingAddress]);
      }
    } else {
      // No existing address
      setAddresses([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user
        ? `${user.firstName || ""} ${user?.lastName || ""}`.trim() ||
          "Nguyễn Văn A"
        : "",
      phone: user?.phone || "",
      streetAddress: "",
      address: {
        province: null,
        district: null,
        ward: null,
        streetAddress: "",
      },
    });
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setIsEditing(false);
    setEditingAddress(null);
    resetForm();
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsEditing(true);
    setIsAdding(false);
    setFormData({
      name: address.name,
      phone: address.phone,
      streetAddress: address.streetAddress,
      address: {
        province: address.province,
        district: address.district,
        ward: address.ward,
        streetAddress: address.streetAddress,
      },
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingAddress(null);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập họ và tên",
      });
      return false;
    }

    if (!formData.phone.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập số điện thoại",
      });
      return false;
    }

    if (!formData.address.province) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn tỉnh/thành phố",
      });
      return false;
    }

    if (!formData.address.district) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn quận/huyện",
      });
      return false;
    }

    if (!formData.address.ward) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng chọn phường/xã",
      });
      return false;
    }

    if (!formData.streetAddress.trim()) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập địa chỉ chi tiết",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Update user profile with address information
      if (updateUser) {
        // Create complete profile update with address
        const profileUpdate = createProfileUpdateFromAddress(formData.address, {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
        });

        const success = await updateUser(profileUpdate);

        if (success) {
          // Create full address string for display
          const newAddress: Address = {
            id: editingAddress?.id || Date.now().toString(),
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            streetAddress: formData.streetAddress.trim(),
            province: formData.address.province!,
            district: formData.address.district!,
            ward: formData.address.ward!,
            isDefault: addresses.length === 0, // First address is default
          };

          if (isEditing && editingAddress) {
            // Update existing address
            setAddresses((prev) =>
              prev.map((addr) =>
                addr.id === editingAddress.id ? newAddress : addr
              )
            );
            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Địa chỉ đã được cập nhật",
            });
          } else {
            // Add new address
            setAddresses((prev) => [...prev, newAddress]);
            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Địa chỉ mới đã được thêm",
            });
          }

          handleCancel();
        } else {
          Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Không thể cập nhật địa chỉ. Vui lòng thử lại.",
          });
        }
      } else {
        // Fallback to local state if updateUser is not available
        const newAddress: Address = {
          id: editingAddress?.id || Date.now().toString(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          streetAddress: formData.streetAddress.trim(),
          province: formData.address.province,
          district: formData.address.district,
          ward: formData.address.ward,
          isDefault: addresses.length === 0,
        };

        if (isEditing && editingAddress) {
          setAddresses((prev) =>
            prev.map((addr) =>
              addr.id === editingAddress.id ? newAddress : addr
            )
          );
          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Địa chỉ đã được cập nhật (chỉ lưu cục bộ)",
          });
        } else {
          setAddresses((prev) => [...prev, newAddress]);
          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Địa chỉ mới đã được thêm (chỉ lưu cục bộ)",
          });
        }

        handleCancel();
      }
    } catch (error) {
      console.error("Error saving address:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể lưu địa chỉ. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: "Địa chỉ mặc định đã được cập nhật",
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    Toast.show({
      type: "info",
      text1: "Xác nhận xóa",
      text2: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      onPress: () => {
        Toast.show({
          type: "info",
          text1: "Xác nhận",
          text2: "Nhấn lại để xác nhận xóa",
          onPress: () => {
            setAddresses((prev) =>
              prev.filter((addr) => addr.id !== addressId)
            );
            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Địa chỉ đã được xóa",
            });
          },
        });
      },
    });
  };

  const renderAddressCard = (address: Address) => (
    <View
      key={address.id}
      className="bg-white rounded-xl p-4 border border-gray-200 mb-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {address.name}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">{address.phone}</Text>
          <AddressDisplay address={address} compact />
        </View>
        {address.isDefault && (
          <View className="bg-green-100 rounded-full px-2 py-1 ml-2">
            <Text className="text-xs font-medium text-green-800">Mặc định</Text>
          </View>
        )}
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleEditAddress(address)}
          className="flex-1 bg-blue-50 rounded-lg py-2 px-3 border border-blue-200"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="pencil" size={16} color="#3B82F6" />
            <Text className="text-sm font-medium text-blue-600 ml-1">
              Chỉnh sửa
            </Text>
          </View>
        </TouchableOpacity>

        {!address.isDefault && (
          <TouchableOpacity
            onPress={() => handleSetDefault(address.id)}
            className="flex-1 bg-green-50 rounded-lg py-2 px-3 border border-green-200"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="star" size={16} color="#10B981" />
              <Text className="text-sm font-medium text-green-600 ml-1">
                Đặt mặc định
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => handleDeleteAddress(address.id)}
          className="bg-red-50 rounded-lg py-2 px-3 border border-red-200"
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddressForm = () => (
    <View className="bg-white rounded-xl p-4 border border-blue-200 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
        {isEditing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
      </Text>

      <View className="space-y-3">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Họ và tên <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Nhập họ và tên"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Số điện thoại <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phone: text }))
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <Text className="text-red-500">*</Text>
          </Text>
          <AddressPicker
            value={formData.address}
            onChange={(address) =>
              setFormData((prev) => ({ ...prev, address }))
            }
            label=""
            placeholder="Chọn tỉnh/thành phố"
            required
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Địa chỉ chi tiết <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={formData.streetAddress}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, streetAddress: text }))
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã)"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Preview selected address */}
        {formData.address.province && (
          <View className="mt-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Xem trước địa chỉ:
            </Text>
            <AddressDisplay address={formData.address} showLabels />
          </View>
        )}
      </View>

      <View className="flex-row space-x-2 mt-4">
        <TouchableOpacity
          onPress={handleCancel}
          className="flex-1 bg-gray-100 rounded-lg py-3 border border-gray-300"
          disabled={loading}
        >
          <Text className="text-center font-medium text-gray-700">Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          className="flex-1 bg-blue-600 rounded-lg py-3 flex-row items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          )}
          <Text className="text-sm font-medium text-white ml-2">
            {loading ? "Đang lưu..." : "Lưu"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            Địa chỉ giao hàng
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Add New Address Button */}
        {!isAdding && !isEditing && (
          <TouchableOpacity
            className="bg-maroon-500 rounded-xl py-4 px-6 mb-6 shadow-sm"
            onPress={handleAddNew}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-center ml-2">
                Thêm địa chỉ mới
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Address Form */}
        {(isAdding || isEditing) && renderAddressForm()}

        {/* Address List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Danh sách địa chỉ ({addresses.length})
          </Text>
          {addresses.length > 0 ? (
            addresses.map(renderAddressCard)
          ) : (
            <View className="bg-white rounded-xl p-8 border border-gray-200 items-center">
              <Ionicons name="location-outline" size={48} color="#CCCCCC" />
              <Text className="text-gray-400 text-center mt-4 text-lg">
                Chưa có địa chỉ nào
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                Hãy thêm địa chỉ đầu tiên để bắt đầu
              </Text>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle"
              size={20}
              color="#3B82F6"
              style={{ marginTop: 2 }}
            />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-blue-800 mb-1">
                Lưu ý về địa chỉ giao hàng
              </Text>
              <Text className="text-xs text-blue-700 leading-4">
                • Địa chỉ mặc định sẽ được sử dụng khi đặt hàng{"\n"}• Bạn có
                thể thêm tối đa 5 địa chỉ giao hàng{"\n"}• Địa chỉ sẽ được lưu
                trữ an toàn và chỉ sử dụng cho mục đích giao hàng{"\n"}• Sử dụng
                API địa chỉ chính xác từ Bộ Tài nguyên và Môi trường{"\n"}• Địa
                chỉ sẽ được đồng bộ với hồ sơ người dùng
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressScreen;
