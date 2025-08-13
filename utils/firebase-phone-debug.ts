import { auth } from "../services/firebase";
import { FirebasePhoneAuthService } from "../services/firebase-phone-auth";

/**
 * Debug Firebase Phone Auth configuration
 */
export const debugFirebasePhoneAuth = () => {
  console.log("🔍 Firebase Phone Auth Debug:");
  console.log("================================");

  // Check Firebase Auth status
  console.log(`✅ Firebase Auth initialized: ${!!auth}`);
  if (auth) {
    console.log(`✅ Auth config:`, {
      apiKey: auth.config?.apiKey ? "Set" : "Missing",
      authDomain: auth.config?.authDomain ? "Set" : "Missing",
      // projectId removed because it does not exist on type 'Config'
    });
  }

  // Check FirebasePhoneAuthService status
  const serviceStatus = FirebasePhoneAuthService.getFirebaseStatus();
  console.log(`✅ Service status:`, serviceStatus);

  // Check if we're in development or production
  console.log(`🌍 Environment: ${__DEV__ ? "Development" : "Production"}`);

  // Check platform
  const platform = require("expo-constants").expoConfig?.platform || "Unknown";
  console.log(`📱 Platform: ${platform}`);

  return {
    authInitialized: !!auth,
    serviceReady: serviceStatus.isReady,
    environment: __DEV__ ? "development" : "production",
    platform,
  };
};

/**
 * Test Firebase Phone Auth with a test phone number
 */
export const testFirebasePhoneAuth = async (
  testPhone: string = "+84901234567"
) => {
  console.log("🧪 Testing Firebase Phone Auth:");
  console.log("=================================");
  console.log(`📱 Test phone: ${testPhone}`);

  try {
    // Check if service is ready
    if (!FirebasePhoneAuthService.isFirebaseReady()) {
      console.error("❌ Firebase Phone Auth service not ready");
      return false;
    }

    // Test phone validation
    const isValid = FirebasePhoneAuthService.validateVietnamesePhone(testPhone);
    console.log(`✅ Phone validation: ${isValid ? "Valid" : "Invalid"}`);

    // Test phone formatting
    const formatted =
      FirebasePhoneAuthService.formatPhoneToInternational(testPhone);
    console.log(`✅ Phone formatting: ${testPhone} → ${formatted}`);

    // Test rate limiting
    const rateLimit = FirebasePhoneAuthService.checkRateLimit();
    console.log(
      `✅ Rate limit check: ${rateLimit.canSend ? "Can send" : `Wait ${rateLimit.remainingTime}s`}`
    );

    console.log("✅ All tests passed - Firebase Phone Auth should work");
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
};

/**
 * Get recommendations for fixing Firebase Phone Auth issues
 */
export const getFirebasePhoneAuthRecommendations = () => {
  const debug = debugFirebasePhoneAuth();

  const recommendations = [];

  if (!debug.authInitialized) {
    recommendations.push(
      "Firebase Auth chưa được khởi tạo - kiểm tra cấu hình"
    );
  }

  if (!debug.serviceReady) {
    recommendations.push("Firebase Phone Auth service chưa sẵn sàng");
  }

  if (debug.environment === "development") {
    recommendations.push(
      "Đang ở development mode - một số tính năng có thể bị hạn chế"
    );
  }

  if (debug.platform === "ios") {
    recommendations.push("iOS: Kiểm tra Bundle ID trong Firebase Console");
  } else if (debug.platform === "android") {
    recommendations.push(
      "Android: Kiểm tra SHA-1 fingerprint trong Firebase Console"
    );
  }

  recommendations.push(
    "Kiểm tra Phone Authentication đã được enable trong Firebase Console"
  );
  recommendations.push("Kiểm tra app đã được thêm vào Firebase project");

  return recommendations;
};
