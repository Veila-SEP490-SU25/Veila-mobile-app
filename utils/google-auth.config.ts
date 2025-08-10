// Cấu hình Google OAuth
export const GOOGLE_AUTH_CONFIG = {
  // Chế độ test: true = mock data, false = Google OAuth thật
  USE_MOCK: false,

  // Google OAuth Client IDs
  // Lấy từ Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
  CLIENT_IDS: {
    WEB: "YOUR_FIREBASE_WEB_CLIENT_ID", // Thay bằng Web client ID từ Firebase
    IOS: "YOUR_FIREBASE_IOS_CLIENT_ID", // Thay bằng iOS client ID từ Firebase
    ANDROID: "YOUR_FIREBASE_ANDROID_CLIENT_ID", // Thay bằng Android client ID từ Firebase
  },

  // Mock data cho testing
  MOCK_DATA: {
    email: "test@gmail.com",
    fullname: "Test User",
  },

  // API endpoints
  ENDPOINTS: {
    GOOGLE_USER_INFO: "https://www.googleapis.com/userinfo/v2/me",
    BACKEND_GOOGLE_LOGIN: "/api/auth/google/login",
  },
};

// Helper function để lấy client ID theo platform
export const getGoogleClientId = (platform: "web" | "ios" | "android") => {
  return GOOGLE_AUTH_CONFIG.CLIENT_IDS[
    platform.toUpperCase() as keyof typeof GOOGLE_AUTH_CONFIG.CLIENT_IDS
  ];
};

// Helper function để kiểm tra có sử dụng mock không
export const isUsingMock = () => GOOGLE_AUTH_CONFIG.USE_MOCK;

// Hướng dẫn lấy Client ID từ Firebase:
// 1. Vào Firebase Console > Authentication > Sign-in method
// 2. Bật Google provider
// 3. Copy Web client ID, iOS client ID, Android client ID
// 4. Paste vào CLIENT_IDS ở trên
