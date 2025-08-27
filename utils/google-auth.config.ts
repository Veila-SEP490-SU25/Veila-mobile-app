
export const GOOGLE_AUTH_CONFIG = {

  USE_MOCK: false,

  CLIENT_IDS: {
    WEB: "406297796172-YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    IOS: "406297796172-YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    ANDROID: "406297796172-YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  },

  MOCK_DATA: {
    email: "test@gmail.com",
    fullname: "Test User",
  },

  ENDPOINTS: {
    GOOGLE_USER_INFO: "https://www.googleapis.com/userinfo/v2/me",
    BACKEND_GOOGLE_LOGIN: "/api/auth/google/login",
  },
};

export const getGoogleClientId = (platform: "web" | "ios" | "android") => {
  return GOOGLE_AUTH_CONFIG.CLIENT_IDS[
    platform.toUpperCase() as keyof typeof GOOGLE_AUTH_CONFIG.CLIENT_IDS
  ];
};

export const isUsingMock = () => GOOGLE_AUTH_CONFIG.USE_MOCK;

