import * as ImagePicker from "expo-image-picker";
import { getTokens } from "../utils";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToFirebase = async (
  imageUri: string,
  folder: string = "complaints",
  filename?: string
): Promise<UploadResult> => {
  try {
    // Lấy blob để kiểm tra dung lượng và gửi binary
    const fileResponse = await fetch(imageUri);
    const blob = await fileResponse.blob();

    // Giới hạn 10MB
    const maxBytes = 10 * 1024 * 1024;
    if (blob.size > maxBytes) {
      return {
        success: false,
        error: "Kích thước tệp vượt quá 10MB",
      };
    }

    // Tạo tên tệp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extFromUri = (() => {
      try {
        const url = new URL(imageUri);
        const pathname = url.pathname;
        const parts = pathname.split(".");
        return parts.length > 1 ? parts.pop() || "jpg" : "jpg";
      } catch {
        const parts = imageUri.split(".");
        return parts.length > 1 ? parts.pop() || "jpg" : "jpg";
      }
    })();
    const fileExtension = extFromUri.toLowerCase();
    const safeFolder = folder?.trim() || "uploads";
    const finalFileName =
      filename?.trim() ||
      `${safeFolder}_${timestamp}_${randomString}.${fileExtension}`;

    // Chuẩn bị FormData cho API /upload
    const formData = new FormData();
    // React Native: append đối tượng file với uri, name, type
    const mimeType =
      fileExtension === "png"
        ? "image/png"
        : fileExtension === "gif"
          ? "image/gif"
          : "image/jpeg";
    (formData as any).append("file", {
      uri: imageUri,
      name: finalFileName,
      type: mimeType,
    });

    const tokens = await getTokens();
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: formData as any,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data && data.statusCode && data.statusCode >= 400)) {
      return {
        success: false,
        error:
          (data && (data.message || data.error)) ||
          `Upload thất bại (${res.status})`,
      };
    }

    const url: string | undefined = data?.item;
    if (!url) {
      return {
        success: false,
        error: "Upload thành công nhưng không nhận được URL",
      };
    }

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const uploadMultipleImagesToFirebase = async (
  imageUris: string[],
  folder: string = "complaints"
): Promise<UploadResult[]> => {
  const uploadPromises = imageUris.map((uri) =>
    uploadImageToFirebase(uri, folder)
  );
  return Promise.all(uploadPromises);
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
  } catch {
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
  } catch {
    return null;
  }
};

export const uploadAvatar = async (uri: string): Promise<UploadResult> => {
  if (!uri) {
    throw new Error("No image URI provided for avatar upload");
  }
  return uploadImageToFirebase(uri, "avatars", `avatar_${Date.now()}.jpg`);
};

export const uploadCover = async (uri: string): Promise<UploadResult> => {
  return uploadImageToFirebase(uri, "covers", `cover_${Date.now()}.jpg`);
};

export const uploadGalleryImage = async (
  uri: string
): Promise<UploadResult> => {
  return uploadImageToFirebase(uri, "gallery", `gallery_${Date.now()}.jpg`);
};
