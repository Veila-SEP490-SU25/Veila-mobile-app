import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPickFromGallery: () => void;
  onTakePhoto: () => void;
}

export default function ImagePickerModal({
  visible,
  onClose,
  onPickFromGallery,
  onTakePhoto,
}: ImagePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn ảnh</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                onPickFromGallery();
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="images-outline" size={32} color="#E05C78" />
              </View>
              <Text style={styles.optionText}>Chọn từ thư viện</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                onTakePhoto();
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="camera-outline" size={32} color="#E05C78" />
              </View>
              <Text style={styles.optionText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  options: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F9F9",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
});
