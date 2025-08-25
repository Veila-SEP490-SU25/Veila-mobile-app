import "dotenv/config";

export default {
  expo: {
    name: "Veila",
    slug: "Veila",
    icon: "./assets/images/logo.png",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "veila",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.veila.app",
    },
    android: {
      package: "com.veila.app", // 👈 Thêm dòng này
    },
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
    },
    plugins: ["expo-router", "expo-video"],
    experiments: {
      typedRoutes: true,
    },
  },
};
