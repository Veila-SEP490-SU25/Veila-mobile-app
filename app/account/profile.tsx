import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddressPicker from "../../components/profile/AddressPicker";
import ImagePickerModal from "../../components/profile/ImagePickerModal";
import { useAuth } from "../../providers/auth.provider";
import {
  pickImage,
  takePhoto,
  uploadAvatar,
} from "../../services/firebase-upload";
import { IAddress, IUpdateProfile } from "../../services/types";
import { createProfileUpdateFromAddress } from "../../utils/address.util";
import { showMessage } from "../../utils/message.util";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    streetAddress: "",
    avatarUrl: "",
    address: {
      province: null,
      district: null,
      ward: null,
      streetAddress: "",
    } as IAddress,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        streetAddress: user.address || "",
        avatarUrl: user.avatarUrl || "",
        address: {
          province: null,
          district: null,
          ward: null,
          streetAddress: user.address || "",
        },
      });
      setTempAvatarUri(null);
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showMessage("ERM007");
      return;
    }

    setLoading(true);
    try {
      const profileData: IUpdateProfile = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || undefined,
        lastName: formData.lastName.trim(),
        avatarUrl: formData.avatarUrl || undefined,
      };

      const profileSuccess = await updateUser(profileData);

      let addressSuccess = true;
      if (
        formData.address.province &&
        formData.address.district &&
        formData.address.ward
      ) {
        const addressUpdate = createProfileUpdateFromAddress(formData.address, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          middleName: formData.middleName.trim() || undefined,
        });

        addressSuccess = await updateUser(addressUpdate);
      }

      if (profileSuccess && addressSuccess) {
        showMessage("SUC004");

        setIsEditing(false);
        setTempAvatarUri(null);
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        showMessage("WRN001");
      }
    } catch {
      showMessage("ERM006");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempAvatarUri(null);

    if (user) {
      setFormData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        streetAddress: user.address || "",
        avatarUrl: user.avatarUrl || "",
        address: {
          province: null,
          district: null,
          ward: null,
          streetAddress: user.address || "",
        },
      });
    }
  };

  const getInitials = () => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handlePickFromGallery = async () => {
    try {
      setUploadingAvatar(true);
      const uri = await pickImage({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (uri) {
        await handleUploadAvatar(uri);
      }
    } catch {
      showMessage("ERM006", "Không thể chọn ảnh từ thư viện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setUploadingAvatar(true);
      const uri = await takePhoto({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (uri) {
        await handleUploadAvatar(uri);
      }
    } catch {
      showMessage("ERM006", "Không thể chụp ảnh");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    try {
      const uploadResult = await uploadAvatar(uri);

      if (!uploadResult.url) {
        throw new Error("Upload failed - no URL returned");
      }

      const uploadedUrl: string = uploadResult.url;

      setFormData((prev) => ({
        ...prev,
        avatarUrl: uploadedUrl,
      }));

      setTempAvatarUri(uploadedUrl);

      const profileData: IUpdateProfile = {
        firstName: user?.firstName || "",
        middleName: user?.middleName || undefined,
        lastName: user?.lastName || "",
        address: user?.address || undefined,
        birthDate: user?.birthDate || undefined,
        avatarUrl: uploadedUrl,
      };

      const success = await updateUser(profileData);

      if (success) {
        showMessage("SUC004", "Cập nhật ảnh đại diện thành công!");
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        showMessage("ERM006", "Không thể cập nhật ảnh đại diện");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showMessage("ERM006", `Lỗi cập nhật ảnh: ${errorMessage}`);
    }
  };

  const handleAvatarPress = () => {
    if (uploadingAvatar) return;

    Alert.alert(
      "Thay đổi ảnh đại diện",
      "Chọn cách thức để cập nhật ảnh đại diện của bạn",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Chọn từ thư viện", onPress: handlePickFromGallery },
        { text: "Chụp ảnh", onPress: handleTakePhoto },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E05C78" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={styles.headerRight}>
          {isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color="#E05C78" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={handleAvatarPress}
            disabled={uploadingAvatar}
            activeOpacity={0.8}
          >
            {tempAvatarUri || formData.avatarUrl || user.avatarUrl ? (
              <Image
                source={{
                  uri: tempAvatarUri || formData.avatarUrl || user.avatarUrl,
                }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Text style={styles.profilePictureText}>{getInitials()}</Text>
              </View>
            )}

            {/* Upload overlay */}
            <View style={styles.uploadOverlay}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              )}
            </View>

            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.changePictureButton,
              uploadingAvatar && styles.disabledButton,
            ]}
            onPress={handleAvatarPress}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.changePictureText}>Đang tải lên...</Text>
              </>
            ) : (
              <>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
                <Text style={styles.changePictureText}>Thay đổi ảnh</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>
                Họ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput]}
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, firstName: text }))
                }
                placeholder="Nhập họ"
                editable={isEditing}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Tên đệm</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput]}
                value={formData.middleName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, middleName: text }))
                }
                placeholder="Nhập tên đệm"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              Tên <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.disabledInput]}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, lastName: text }))
              }
              placeholder="Nhập tên"
              editable={isEditing}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={user.email}
              placeholder="Email"
              editable={false}
            />
            <Text style={styles.fieldNote}>Email không thể thay đổi</Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Số điện thoại</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={formData.phone}
              placeholder="Nhập số điện thoại"
              editable={false}
            />
            <Text style={styles.fieldNote}>
              Số điện thoại sẽ được cập nhật thông qua xác thực
            </Text>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Địa chỉ</Text>
            {isEditing ? (
              <AddressPicker
                value={formData.address}
                onChange={(address) =>
                  setFormData((prev) => ({ ...prev, address }))
                }
                label=""
                placeholder="Chọn địa chỉ"
              />
            ) : (
              <View style={styles.addressDisplay}>
                <Text style={styles.addressText}>
                  {user.address || "Chưa có địa chỉ"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Địa chỉ chi tiết</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput]}
                value={formData.streetAddress}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, streetAddress: text }))
                }
                placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường)"
                multiline
                numberOfLines={2}
              />
            ) : (
              <View style={styles.addressDisplay}>
                <Text style={styles.addressText}>
                  {user.address || "Chưa có địa chỉ chi tiết"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Ngày sinh</Text>
            <TextInput
              style={[styles.textInput, styles.disabledInput]}
              value={
                user.birthDate
                  ? new Date(user.birthDate).toLocaleDateString("vi-VN")
                  : ""
              }
              placeholder="Chưa có ngày sinh"
              editable={false}
            />
            <Text style={styles.fieldNote}>
              Tính năng cập nhật ngày sinh đang phát triển
            </Text>
          </View>
        </View>

        {/* Account Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Trạng thái tài khoản</Text>

          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <Ionicons
                name={user.isVerified ? "checkmark-circle" : "close-circle"}
                size={20}
                color={user.isVerified ? "#10B981" : "#EF4444"}
              />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Xác thực tài khoản</Text>
              <Text style={styles.statusValue}>
                {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <Ionicons
                name={user.isIdentified ? "checkmark-circle" : "close-circle"}
                size={20}
                color={user.isIdentified ? "#10B981" : "#EF4444"}
              />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Xác thực số điện thoại</Text>
              <Text style={styles.statusValue}>
                {user.isIdentified ? "Đã xác thực" : "Chưa xác thực"}
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIcon}>
              <Ionicons name="star" size={20} color="#F59E0B" />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Điểm uy tín</Text>
              <Text style={styles.statusValue}>
                {user.reputation || 0} điểm
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!isEditing && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/_auth/phone-verification")}
            >
              <Ionicons name="call" size={20} color="#3B82F6" />
              <Text style={styles.actionButtonText}>
                Xác thực số điện thoại
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/account/address")}
            >
              <Ionicons name="location" size={20} color="#10B981" />
              <Text style={styles.actionButtonText}>Quản lý địa chỉ</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onPickFromGallery={handlePickFromGallery}
        onTakePhoto={handleTakePhoto}
      />

      {/* Debug Component (development only) - Hidden by default */}
      {/* <AvatarUploadDebug /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    minWidth: 80,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E05C78",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E05C78",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePictureText: {
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
    zIndex: 2,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  changePictureButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E05C78",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changePictureText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  fieldNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  addressDisplay: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  addressText: {
    fontSize: 16,
    color: "#6B7280",
  },
  statusSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
});
