import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { shopApi } from "../../services/apis/shop.api";
import {
  pickImage,
  takePhoto,
  uploadImageToFirebase,
} from "../../services/firebase-upload";
import { showMessage } from "../../utils/message.util";

export default function RegisterShopScreen() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    licenseImages: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePicker = async () => {
    Alert.alert("Chọn ảnh giấy phép", "Chọn cách lấy ảnh", [
      {
        text: "Chụp ảnh",
        onPress: async () => {
          const photoUri = await takePhoto({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (photoUri) {
            await uploadLicenseImage(photoUri);
          }
        },
      },
      {
        text: "Chọn từ thư viện",
        onPress: async () => {
          const imageUri = await pickImage({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (imageUri) {
            await uploadLicenseImage(imageUri);
          }
        },
      },
      {
        text: "Hủy",
        style: "cancel",
      },
    ]);
  };

  const uploadLicenseImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      setSelectedImage(imageUri);

      // Upload qua API /upload
      const uploadResult = await uploadImageToFirebase(
        imageUri,
        "shop-licenses",
        `license_${Date.now()}.jpg`
      );

      // Update form data với URL trả về
      const uploadedUrl: string = uploadResult.url || "";
      setFormData((prev) => ({
        ...prev,
        licenseImages: uploadedUrl,
      }));

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Ảnh giấy phép đã được tải lên",
      });

      console.log("✅ License image uploaded:", uploadResult.url);
    } catch (error: any) {
      console.error("❌ Error uploading license image:", error);
      showMessage("ERM006", "Không thể tải ảnh lên. Vui lòng thử lại.");

      // Reset image selection on error
      setSelectedImage(null);
      setFormData((prev) => ({
        ...prev,
        licenseImages: "",
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeSelectedImage = () => {
    Alert.alert("Xóa ảnh", "Bạn có chắc muốn xóa ảnh giấy phép đã chọn?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setSelectedImage(null);
          setFormData((prev) => ({
            ...prev,
            licenseImages: "",
          }));
        },
      },
    ]);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showMessage("ERM001", "Vui lòng nhập tên shop");
      return false;
    }
    if (!formData.phone.trim()) {
      showMessage("ERM001", "Vui lòng nhập số điện thoại");
      return false;
    }
    if (!formData.email.trim()) {
      showMessage("ERM001", "Vui lòng nhập email");
      return false;
    }
    if (!formData.address.trim()) {
      showMessage("ERM001", "Vui lòng nhập địa chỉ");
      return false;
    }
    if (!formData.licenseImages.trim()) {
      showMessage("ERM001", "Vui lòng chọn ảnh giấy phép");
      return false;
    }

    // Validate upload URL đã có
    if (!formData.licenseImages.startsWith("http")) {
      showMessage("ERM001", "Ảnh giấy phép chưa được tải lên thành công");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage("ERM001", "Email không đúng định dạng");
      return false;
    }

    // Validate phone format (Vietnamese)
    const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      showMessage("ERM001", "Số điện thoại không đúng định dạng");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      console.log("🚀 Submitting shop registration with data:", {
        ...formData,
        licenseImages: formData.licenseImages.substring(0, 100) + "...",
      });

      const result = await shopApi.registerShop(formData);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: result.message,
        });

        console.log("✅ Shop registration successful:", result);

        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          address: "",
          licenseImages: "",
        });
        setSelectedImage(null);

        // Quay lại trang account
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        console.log("❌ Shop registration failed:", result);
        showMessage("ERM006", result.message);
      }
    } catch (error: any) {
      console.error("❌ Error registering shop:", error);
      showMessage("ERM006", "Có lỗi xảy ra khi đăng ký shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 flex-1 text-center mx-4">
            Đăng ký shop
          </Text>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <View className="flex-row items-start gap-x-3">
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View className="flex-1">
              <Text className="text-blue-800 font-semibold mb-2">
                Thông tin đăng ký shop
              </Text>
              <Text className="text-blue-700 text-sm leading-5">
                • Chỉ dành cho khách hàng{"\n"}• Shop sẽ được xét duyệt bởi
                admin{"\n"}• Bạn sẽ nhận được thông báo khi được duyệt
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="space-y-6">
          {/* Shop Name */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Tên shop <Text className="text-red-500">*</Text>
            </Text>
            <Input
              placeholder="Nhập tên shop"
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              maxLength={100}
            />
          </View>

          {/* Phone */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <Text className="text-red-500">*</Text>
            </Text>
            <Input
              placeholder="+84 901 234 567"
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email <Text className="text-red-500">*</Text>
            </Text>
            <Input
              placeholder="shop@gmail.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />
          </View>

          {/* Address */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Địa chỉ <Text className="text-red-500">*</Text>
            </Text>
            <Input
              placeholder="Nhập địa chỉ đầy đủ"
              value={formData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* License Images */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Ảnh giấy phép kinh doanh <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={handleImagePicker}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
              activeOpacity={0.7}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <View className="items-center py-8">
                  <View className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <Text className="text-gray-600 text-center">
                    Đang tải ảnh lên...
                  </Text>
                </View>
              ) : selectedImage ? (
                <View className="w-full">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-full h-32 rounded-lg mb-3"
                    resizeMode="cover"
                  />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">
                      Ảnh đã được chọn
                    </Text>
                    <TouchableOpacity
                      onPress={removeSelectedImage}
                      className="bg-red-100 px-3 py-1 rounded-full"
                      activeOpacity={0.7}
                    >
                      <Text className="text-red-600 text-xs font-medium">
                        Xóa ảnh
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-600 mt-2 text-center">
                    Chạm để chọn ảnh giấy phép
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1 text-center">
                    Hỗ trợ: JPG, PNG (Tối đa 5MB)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <Button
            title="Gửi đăng ký"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            className="mt-6"
          />

          {/* Note */}
          <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <View className="flex-row items-start gap-x-3">
              <Ionicons name="warning-outline" size={20} color="#F59E0B" />
              <View className="flex-1">
                <Text className="text-yellow-800 text-sm leading-5">
                  <Text className="font-semibold">Lưu ý:</Text> Thông tin đăng
                  ký sẽ được xem xét trong vòng 3-5 ngày làm việc. Bạn sẽ nhận
                  được email thông báo kết quả.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}
