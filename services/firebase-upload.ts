import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadImageToFirebase = async (
  uri: string,
  folder: string,
  fileName?: string
): Promise<UploadResult> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const uniqueFileName =
      fileName || `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fileExtension = uri.split(".").pop() || "jpg";
    const fullFileName = `${uniqueFileName}.${fileExtension}`;

    const storageRef = ref(storage, `${folder}/${fullFileName}`);

    const snapshot = await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

export const pickImage = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}): Promise<string | null> => {
  try {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần quyền truy cập thư viện ảnh để chọn ảnh");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
};

export const takePhoto = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<string | null> => {
  try {

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Cần quyền truy cập camera để chụp ảnh");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error taking photo:", error);
    return null;
  }
};

export const uploadAvatar = async (uri: string): Promise<UploadResult> => {
  return uploadImageToFirebase(uri, "avatars", `avatar_${Date.now()}`);
};

export const uploadCover = async (uri: string): Promise<UploadResult> => {
  return uploadImageToFirebase(uri, "covers", `cover_${Date.now()}`);
};

export const uploadGalleryImage = async (
  uri: string
): Promise<UploadResult> => {
  return uploadImageToFirebase(uri, "gallery", `gallery_${Date.now()}`);
};
