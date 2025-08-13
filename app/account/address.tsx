import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/auth.provider";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

const AddressScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: user?.firstName + " " + user?.lastName || "Nguyễn Văn A",
      phone: user?.phone || "0901234567",
      address: "123 Đường Nguyễn Huệ",
      city: "TP.HCM",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      isDefault: true,
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsEditing(true);
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id ? editingAddress : addr
        )
      );
      setIsEditing(false);
      setEditingAddress(null);
      Alert.alert("Thành công", "Địa chỉ đã được cập nhật");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingAddress(null);
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
    Alert.alert("Thành công", "Địa chỉ mặc định đã được cập nhật");
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
          Alert.alert("Thành công", "Địa chỉ đã được xóa");
        },
      },
    ]);
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
          <Text className="text-sm text-gray-700 leading-5">
            {address.address}, {address.ward}, {address.district},{" "}
            {address.city}
          </Text>
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

  const renderEditForm = () => (
    <View className="bg-white rounded-xl p-4 border border-blue-200 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Chỉnh sửa địa chỉ
      </Text>

      <View className="space-y-3">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Họ và tên
          </Text>
          <TextInput
            value={editingAddress?.name}
            onChangeText={(text) =>
              setEditingAddress((prev) =>
                prev ? { ...prev, name: text } : null
              )
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Nhập họ và tên"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </Text>
          <TextInput
            value={editingAddress?.phone}
            onChangeText={(text) =>
              setEditingAddress((prev) =>
                prev ? { ...prev, phone: text } : null
              )
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Địa chỉ
          </Text>
          <TextInput
            value={editingAddress?.address}
            onChangeText={(text) =>
              setEditingAddress((prev) =>
                prev ? { ...prev, address: text } : null
              )
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Nhập địa chỉ chi tiết"
          />
        </View>

        <View className="flex-row space-x-2">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Phường/Xã
            </Text>
            <TextInput
              value={editingAddress?.ward}
              onChangeText={(text) =>
                setEditingAddress((prev) =>
                  prev ? { ...prev, ward: text } : null
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              placeholder="Phường/Xã"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Quận/Huyện
            </Text>
            <TextInput
              value={editingAddress?.district}
              onChangeText={(text) =>
                setEditingAddress((prev) =>
                  prev ? { ...prev, district: text } : null
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              placeholder="Quận/Huyện"
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố
          </Text>
          <TextInput
            value={editingAddress?.city}
            onChangeText={(text) =>
              setEditingAddress((prev) =>
                prev ? { ...prev, city: text } : null
              )
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Tỉnh/Thành phố"
          />
        </View>
      </View>

      <View className="flex-row space-x-2 mt-4">
        <TouchableOpacity
          onPress={handleCancelEdit}
          className="flex-1 bg-gray-100 rounded-lg py-3 border border-gray-300"
        >
          <Text className="text-center font-medium text-gray-700">Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSaveAddress}
          className="flex-1 bg-blue-600 rounded-lg py-3"
        >
          <Text className="text-center font-medium text-white">Lưu</Text>
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
          <Text className="text-xl font-bold text-gray-900">
            Địa chỉ giao hàng
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Add New Address Button */}
        <TouchableOpacity className="bg-maroon-500 rounded-xl py-4 px-6 mb-6 shadow-sm">
          <View className="flex-row items-center justify-center">
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-center ml-2">
              Thêm địa chỉ mới
            </Text>
          </View>
        </TouchableOpacity>

        {/* Edit Form */}
        {isEditing && editingAddress && renderEditForm()}

        {/* Address List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Danh sách địa chỉ ({addresses.length})
          </Text>
          {addresses.map(renderAddressCard)}
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
                • Địa chỉ mặc định sẽ được sử dụng khi đặt hàng • Bạn có thể
                thêm tối đa 5 địa chỉ giao hàng • Địa chỉ sẽ được lưu trữ an
                toàn và chỉ sử dụng cho mục đích giao hàng
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressScreen;
