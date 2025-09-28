import { Ionicons } from "@expo/vector-icons";
import * as ExpoImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImagePickerProps {
  onImageSelected: (imageUri: string, caption?: string) => void;
  onClose: () => void;
}

export default function ImagePicker({
  onImageSelected,
  onClose,
}: ImagePickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const pickImage = async () => {
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chọn hình ảnh. Vui lòng thử lại.");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập", "Cần quyền truy cập camera để chụp ảnh.");
        return;
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleSend = () => {
    if (!selectedImage) return;
    onImageSelected(selectedImage, caption.trim() || undefined);
    onClose();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setCaption("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gửi hình ảnh</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {!selectedImage ? (
        <View style={styles.pickerContainer}>
          <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
            <Ionicons name="images" size={32} color="#E05C78" />
            <Text style={styles.pickerText}>Chọn từ thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
            <Ionicons name="camera" size={32} color="#E05C78" />
            <Text style={styles.pickerText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />

          <View style={styles.captionContainer}>
            <Text style={styles.captionLabel}>Chú thích (tùy chọn):</Text>
            <Text style={styles.captionText}>{caption}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="trash" size={20} color="#666" />
              <Text style={styles.removeText}>Xóa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.sendText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  pickerContainer: {
    alignItems: "center",
    gap: 20,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    minWidth: 200,
    justifyContent: "center",
    gap: 12,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  previewContainer: {
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  captionContainer: {
    width: "100%",
    marginBottom: 20,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  captionText: {
    fontSize: 16,
    color: "#333",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    gap: 8,
  },
  removeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E05C78",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
