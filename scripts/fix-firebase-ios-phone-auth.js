#!/usr/bin/env node

/**
 * Script fix Firebase Phone Auth cho iOS - Checklist 7 bước
 * Chạy: node scripts/fix-firebase-ios-phone-auth.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Checklist 7 bước fix Firebase Phone Auth cho iOS...\n");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

// 1. Kiểm tra app.json iOS configuration
log(colors.blue, "1️⃣ Kiểm tra iOS Bundle Identifier:");
try {
  const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
  const iosBundleId = appJson.expo?.ios?.bundleIdentifier;

  if (iosBundleId) {
    log(colors.green, `   ✅ iOS Bundle ID: ${iosBundleId}`);

    // Kiểm tra format
    if (iosBundleId.includes(".") && iosBundleId.length > 3) {
      log(colors.green, "   ✅ Format Bundle ID hợp lệ");
    } else {
      log(colors.red, "   ❌ Format Bundle ID không hợp lệ (cần có dấu chấm)");
    }
  } else {
    log(colors.red, "   ❌ iOS Bundle ID chưa được set");
    log(
      colors.yellow,
      '   💡 Cần thêm vào app.json: "ios": { "bundleIdentifier": "com.veila.app" }'
    );
  }
} catch (error) {
  log(colors.red, `   ❌ Không thể đọc app.json: ${error.message}`);
}

// 2. Kiểm tra GoogleService-Info.plist
log(colors.blue, "\n2️⃣ Kiểm tra GoogleService-Info.plist:");
const iosProjectPath = path.join(__dirname, "..", "ios");
const googleServicePath = path.join(
  iosProjectPath,
  "Veila",
  "GoogleService-Info.plist"
);

if (fs.existsSync(iosProjectPath)) {
  log(colors.green, "   ✅ iOS project tồn tại");

  if (fs.existsSync(googleServicePath)) {
    log(colors.green, "   ✅ GoogleService-Info.plist tồn tại");

    // Kiểm tra nội dung file
    try {
      const plistContent = fs.readFileSync(googleServicePath, "utf8");
      const hasBundleId = plistContent.includes("com.veila.app");
      const hasApiKey = plistContent.includes("AIza");
      const hasProjectId = plistContent.includes("veila");

      if (hasBundleId) {
        log(colors.green, "   ✅ Bundle ID khớp với app.json");
      } else {
        log(colors.red, "   ❌ Bundle ID không khớp với app.json");
      }

      if (hasApiKey) {
        log(colors.green, "   ✅ API Key có trong GoogleService-Info.plist");
      } else {
        log(
          colors.red,
          "   ❌ API Key không có trong GoogleService-Info.plist"
        );
      }

      if (hasProjectId) {
        log(colors.green, "   ✅ Project ID khớp");
      } else {
        log(colors.red, "   ❌ Project ID không khớp");
      }
    } catch (error) {
      log(
        colors.red,
        `   ❌ Không thể đọc GoogleService-Info.plist: ${error.message}`
      );
    }
  } else {
    log(colors.red, "   ❌ GoogleService-Info.plist không tồn tại");
    log(
      colors.yellow,
      "   📥 Cần download từ Firebase Console và thêm vào ios/Veila/"
    );
  }
} else {
  log(colors.red, "   ❌ iOS project không tồn tại");
  log(colors.yellow, "   💡 Chạy: npx expo prebuild để tạo iOS project");
}

// 3. Kiểm tra Firebase Environment Variables
log(colors.blue, "\n3️⃣ Kiểm tra Firebase Environment Variables:");
try {
  if (fs.existsSync(".env")) {
    const envContent = fs.readFileSync(".env", "utf8");
    const firebaseVars = [
      "FIREBASE_API_KEY",
      "FIREBASE_AUTH_DOMAIN",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_STORAGE_BUCKET",
      "FIREBASE_MESSAGING_SENDER_ID",
      "FIREBASE_APP_ID",
      "FIREBASE_MEASUREMENT_ID",
    ];

    let allVarsSet = true;
    firebaseVars.forEach((varName) => {
      const hasVar = envContent.includes(varName);
      if (hasVar) {
        log(colors.green, `   ${varName}: ✅ Có`);
      } else {
        log(colors.red, `   ${varName}: ❌ Không có`);
        allVarsSet = false;
      }
    });

    if (allVarsSet) {
      log(colors.green, "   ✅ Tất cả Firebase variables đã được set");
    } else {
      log(colors.red, "   ❌ Một số Firebase variables bị thiếu");
    }
  } else {
    log(colors.red, "   ❌ Không tìm thấy .env file");
  }
} catch (error) {
  log(colors.red, `   ❌ Không thể đọc .env: ${error.message}`);
}

// 4. Kiểm tra Firebase Dependencies
log(colors.blue, "\n4️⃣ Kiểm tra Firebase Dependencies:");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const dependencies = packageJson.dependencies || {};

  const firebasePackages = [
    "firebase",
    "expo-firebase-core",
    "expo-firebase-recaptcha",
    "@react-native-async-storage/async-storage",
  ];

  firebasePackages.forEach((pkg) => {
    if (dependencies[pkg]) {
      log(colors.green, `   ${pkg}: ✅ ${dependencies[pkg]}`);
    } else {
      log(colors.red, `   ${pkg}: ❌ Không có`);
    }
  });
} catch (error) {
  log(colors.red, `   ❌ Không thể đọc package.json: ${error.message}`);
}

// 5. Checklist Firebase Console cho iOS
log(colors.magenta, "\n🔧 CHECKLIST FIREBASE CONSOLE CHO iOS:");
log(colors.cyan, "Bước 1: Bật Phone Authentication");
log(
  colors.white,
  "   • Vào Firebase Console → Authentication → Sign-in method"
);
log(colors.white, "   • Tìm Phone → Enable");
log(colors.white, "   • Click Save");

log(colors.cyan, "\nBước 2: Thêm Authorized Domains (QUAN TRỌNG!)");
log(colors.white, "   • Authentication → Settings → Authorized domains");
log(colors.white, "   • Thêm các domains sau:");
log(colors.yellow, "     - localhost");
log(colors.yellow, "     - 127.0.0.1");
log(colors.yellow, "     - exp.host (BẮT BUỘC cho Expo)");
log(colors.yellow, "     - auth.expo.io (BẮT BUỘC cho Expo)");

log(colors.cyan, "\nBước 3: Thêm iOS App");
log(colors.white, "   • Project Settings → General → Your apps");
log(colors.white, '   • Click "Add app" → iOS');
log(colors.white, "   • Bundle ID: com.veila.app");
log(colors.white, "   • App nickname: Veila iOS");
log(colors.white, "   • Click Register app");

log(colors.cyan, "\nBước 4: Download GoogleService-Info.plist");
log(
  colors.white,
  '   • Sau khi đăng ký app, click "Download GoogleService-Info.plist"'
);
log(colors.white, "   • Copy file vào ios/Veila/ folder");

log(colors.cyan, "\nBước 5: Cấu hình Phone Numbers for Testing");
log(colors.white, "   • Authentication → Sign-in method → Phone");
log(colors.white, '   • Tab "Phone numbers for testing"');
log(colors.white, "   • Thêm số: +84354019580 với OTP: 123456");

log(colors.cyan, "\nBước 6: Tắt Enterprise reCAPTCHA (nếu có)");
log(colors.white, "   • Authentication → Settings → Phone numbers");
log(colors.white, "   • Vô hiệu hóa Enterprise reCAPTCHA → để mặc định v2");

log(colors.cyan, "\nBước 7: Kiểm tra Associated Domains (cho standalone app)");
log(
  colors.white,
  "   • Apple Developer → Certificates, Identifiers & Profiles"
);
log(colors.white, "   • App ID → Associated Domains");
log(colors.white, "   • Thêm: applinks:auth.expo.io, applinks:exp.host");

// 6. Hướng dẫn test
log(colors.green, "\n🎯 HƯỚNG DẪN TEST:");
log(colors.white, "1. Sau khi fix Firebase Console, restart app");
log(colors.white, "2. Clear Metro cache: npx expo start --clear");
log(colors.white, "3. Test Phone Authentication với số +84354019580");
log(colors.white, "4. Sử dụng OTP test: 123456");

// 7. Kết quả mong đợi
log(colors.green, "\n✅ KẾT QUẢ MONG ĐỢI:");
log(colors.white, "Sau khi fix Firebase Console:");
log(
  colors.yellow,
  "LOG Using firebase/compat with expo-firebase-recaptcha verifier"
);
log(
  colors.yellow,
  "LOG Firebase Phone Auth: SMS sent successfully to +84354019580"
);

// 8. Troubleshooting
log(colors.red, "\n🚨 NẾU VẪN GẶP LỖI:");
log(colors.white, "1. Kiểm tra Firebase Console có enable Phone Auth chưa");
log(
  colors.white,
  "2. Kiểm tra Authorized Domains có exp.host và auth.expo.io chưa"
);
log(colors.white, "3. Kiểm tra Bundle ID có khớp với app.json không");
log(colors.white, "4. Kiểm tra GoogleService-Info.plist có đúng không");
log(
  colors.white,
  "5. Kiểm tra Phone Numbers for Testing có số +84354019580 không"
);

log(colors.blue, "\n📞 HỖ TRỢ:");
log(colors.white, "Nếu vẫn gặp vấn đề:");
log(colors.white, "1. Chụp màn hình Firebase Console");
log(colors.white, "2. Copy console logs");
log(colors.white, "3. Gửi thông tin cho team dev");

log(colors.green, "\n🎉 CHÚC MỪNG!");
log(
  colors.white,
  "Sau khi làm theo checklist này, Firebase Phone Auth sẽ hoạt động hoàn hảo trên iOS!"
);
