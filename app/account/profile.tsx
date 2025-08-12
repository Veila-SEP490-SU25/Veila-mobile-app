import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AddressPicker from "../../components/profile/AddressPicker";
import DatePicker from "../../components/profile/DatePicker";
import ImagePickerModal from "../../components/profile/ImagePickerModal";
import ValidationPopup from "../../components/profile/ValidationPopup";
import { useAuth } from "../../providers/auth.provider";
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from "../../services/apis";
import {
  pickImage,
  takePhoto,
  uploadAvatar,
  uploadCover,
  UploadResult,
} from "../../services/firebase-upload";
import {
  IAddress,
  IChangePassword,
  IUpdateProfile,
} from "../../services/types";

interface ValidationError {
  field: string;
  message: string;
}

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageType, setImageType] = useState<"avatar" | "cover">("avatar");
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [profileForm, setProfileForm] = useState<IUpdateProfile>({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    address: user?.address || "",
    birthDate: user?.birthDate || "",
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
    images: user?.images || "",
  });

  const [addressForm, setAddressForm] = useState<IAddress>({
    province: null,
    district: null,
    ward: null,
    streetAddress: "",
  });

  const [passwordForm, setPasswordForm] = useState<IChangePassword>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        address: user.address || "",
        birthDate: user.birthDate || "",
        avatarUrl: user.avatarUrl || "",
        coverUrl: user.coverUrl || "",
        images: user.images || "",
      });
    }
  }, [user]);

  const validateProfile = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!profileForm.firstName.trim()) {
      errors.push({ field: "firstName", message: "Họ không được để trống" });
    }

    if (!profileForm.lastName.trim()) {
      errors.push({ field: "lastName", message: "Tên không được để trống" });
    }

    if (!profileForm.address?.trim()) {
      errors.push({ field: "address", message: "Địa chỉ không được để trống" });
    }

    if (!profileForm.birthDate?.trim()) {
      errors.push({
        field: "birthDate",
        message: "Ngày sinh không được để trống",
      });
    }

    return errors;
  };

  const handleImageUpload = async (uri: string) => {
    try {
      setIsUploading(true);
      let uploadResult: UploadResult;

      if (imageType === "avatar") {
        uploadResult = await uploadAvatar(uri);
        setProfileForm((prev) => ({ ...prev, avatarUrl: uploadResult.url }));

        // Cập nhật user state ngay lập tức để hiển thị avatar mới
        if (refreshUser) {
          refreshUser();
        }
      } else {
        uploadResult = await uploadCover(uri);
        setProfileForm((prev) => ({ ...prev, coverUrl: uploadResult.url }));
      }

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Tải lên ${imageType === "avatar" ? "ảnh đại diện" : "ảnh bìa"} thành công`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Tải lên ảnh thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickFromGallery = async () => {
    const uri = await pickImage();
    if (uri) {
      await handleImageUpload(uri);
    }
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      await handleImageUpload(uri);
    }
  };

  const handleAvatarPress = () => {
    setImageType("avatar");
    setShowImagePicker(true);
  };

  const handleAddressChange = (address: IAddress) => {
    setAddressForm(address);

    // Ghép chuỗi địa chỉ chi tiết và địa chỉ từ picker
    const addressParts = [
      addressForm.streetAddress, // Địa chỉ chi tiết hiện tại
      address.ward?.name,
      address.district?.name,
      address.province?.name,
    ].filter(Boolean);

    const addressString = addressParts.join(", ");
    setProfileForm((prev) => ({ ...prev, address: addressString }));
  };

  const handleStreetAddressChange = (streetAddress: string) => {
    setAddressForm((prev) => ({ ...prev, streetAddress }));

    // Cập nhật lại địa chỉ đầy đủ khi thay đổi địa chỉ chi tiết
    const addressParts = [
      streetAddress,
      addressForm.ward?.name,
      addressForm.district?.name,
      addressForm.province?.name,
    ].filter(Boolean);

    const addressString = addressParts.join(", ");
    setProfileForm((prev) => ({ ...prev, address: addressString }));
  };

  // Hàm để hiển thị địa chỉ đầy đủ
  const getFullAddress = () => {
    if (profileForm.address) {
      return profileForm.address;
    }

    const addressParts = [
      addressForm.streetAddress,
      addressForm.ward?.name,
      addressForm.district?.name,
      addressForm.province?.name,
    ].filter(Boolean);

    return addressParts.length > 0
      ? addressParts.join(", ")
      : "Chưa có địa chỉ";
  };

  const handleBirthDateChange = (date: string) => {
    setProfileForm((prev) => ({ ...prev, birthDate: date }));
  };

  const handleProfileUpdate = async () => {
    const errors = validateProfile();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationPopup(true);
      return;
    }

    try {
      await updateProfile(profileForm).unwrap();
      await refreshUser();
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Cập nhật thông tin thành công",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.data?.message || "Cập nhật thất bại",
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Vui lòng điền đầy đủ thông tin",
        });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Mật khẩu mới không khớp",
        });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Mật khẩu phải có ít nhất 6 ký tự",
        });
        return;
      }

      await changePassword(passwordForm).unwrap();
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đổi mật khẩu thành công",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.data?.message || "Đổi mật khẩu thất bại",
      });
    }
  };

  const getInitials = () => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            </View>
          )}
          <TouchableOpacity
            style={[styles.cameraButton, isUploading && styles.uploadingButton]}
            onPress={handleAvatarPress}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarLabel}>
          {isUploading ? "Đang tải lên..." : "Thay đổi ảnh đại diện"}
        </Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ *</Text>
          <TextInput
            style={styles.textInput}
            value={profileForm.firstName}
            onChangeText={(text) =>
              setProfileForm((prev) => ({ ...prev, firstName: text }))
            }
            placeholder="Nhập họ"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tên đệm</Text>
          <TextInput
            style={styles.textInput}
            value={profileForm.middleName}
            onChangeText={(text) =>
              setProfileForm((prev) => ({ ...prev, middleName: text }))
            }
            placeholder="Nhập tên đệm"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tên *</Text>
          <TextInput
            style={styles.textInput}
            value={profileForm.lastName}
            onChangeText={(text) =>
              setProfileForm((prev) => ({ ...prev, lastName: text }))
            }
            placeholder="Nhập tên"
            placeholderTextColor="#999999"
          />
        </View>

        <AddressPicker
          value={addressForm}
          onChange={handleAddressChange}
          label="Địa chỉ *"
        />

        {/* Hiển thị địa chỉ đầy đủ */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Địa chỉ đầy đủ</Text>
          <View style={styles.addressDisplay}>
            <Text style={styles.addressText}>{getFullAddress()}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Địa chỉ chi tiết</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={addressForm.streetAddress}
            onChangeText={handleStreetAddressChange}
            placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phố...)"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
          />
        </View>

        <DatePicker
          value={profileForm.birthDate || ""}
          onChange={handleBirthDateChange}
          label="Ngày sinh *"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          isUpdatingProfile && styles.saveButtonDisabled,
        ]}
        onPress={handleProfileUpdate}
        disabled={isUpdatingProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {isUpdatingProfile ? "Đang cập nhật..." : "Cập nhật thông tin"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
          <TextInput
            style={styles.textInput}
            value={passwordForm.currentPassword}
            onChangeText={(text) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: text }))
            }
            placeholder="Nhập mật khẩu hiện tại"
            placeholderTextColor="#999999"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
          <TextInput
            style={styles.textInput}
            value={passwordForm.newPassword}
            onChangeText={(text) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: text }))
            }
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="#999999"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
          <TextInput
            style={styles.textInput}
            value={passwordForm.confirmPassword}
            onChangeText={(text) =>
              setPasswordForm((prev) => ({ ...prev, confirmPassword: text }))
            }
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="#999999"
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          isChangingPassword && styles.saveButtonDisabled,
        ]}
        onPress={handlePasswordChange}
        disabled={isChangingPassword}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "profile" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("profile")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "profile" && styles.activeTabButtonText,
              ]}
            >
              Thông tin cá nhân
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "password" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("password")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "password" && styles.activeTabButtonText,
              ]}
            >
              Đổi mật khẩu
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === "profile" ? renderProfileTab() : renderPasswordTab()}
        </ScrollView>
      </KeyboardAvoidingView>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onPickFromGallery={handlePickFromGallery}
        onTakePhoto={handleTakePhoto}
      />

      <ValidationPopup
        visible={showValidationPopup}
        errors={validationErrors}
        onClose={() => setShowValidationPopup(false)}
        onContinue={() => setShowValidationPopup(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: "#E05C78",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    textAlign: "center",
  },
  activeTabButtonText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E05C78",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E05C78",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadingButton: {
    backgroundColor: "#6B7280",
    shadowOpacity: 0.1,
  },
  avatarLabel: {
    fontSize: 14,
    color: "#666666",
  },
  formSection: {
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#E05C78",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addressDisplay: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
});
