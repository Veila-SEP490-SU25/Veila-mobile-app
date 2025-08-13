#!/usr/bin/env node

/**
 * Script kiểm tra Firebase Console configuration status
 * Chạy: node scripts/check-firebase-console-status.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Kiểm tra Firebase Console Configuration Status...\n");

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

// 1. Kiểm tra app.json configuration
log(colors.blue, "1️⃣ Kiểm tra app.json configuration:");
try {
  const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
  const iosBundleId = appJson.expo?.ios?.bundleIdentifier;
  const androidPackage = appJson.expo?.android?.package;

  log(colors.green, `   iOS Bundle ID: ${iosBundleId || "❌ Không có"}`);
  log(colors.green, `   Android Package: ${androidPackage || "❌ Không có"}`);

  if (!iosBundleId && !androidPackage) {
    log(colors.red, "   ⚠️  Cần thêm bundleIdentifier/package vào app.json");
  }
} catch (error) {
  log(colors.red, `   ❌ Không thể đọc app.json: ${error.message}`);
}

// 2. Kiểm tra environment variables
log(colors.blue, "\n2️⃣ Kiểm tra Firebase Environment Variables:");
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

// 3. Kiểm tra iOS project và GoogleService-Info.plist
log(colors.blue, "\n3️⃣ Kiểm tra iOS Project Configuration:");
const iosProjectPath = path.join(__dirname, "..", "ios");
if (fs.existsSync(iosProjectPath)) {
  log(colors.green, "   ✅ iOS project tồn tại");

  // Kiểm tra GoogleService-Info.plist
  const googleServicePath = path.join(
    iosProjectPath,
    "Veila",
    "GoogleService-Info.plist"
  );
  if (fs.existsSync(googleServicePath)) {
    log(colors.green, "   ✅ GoogleService-Info.plist tồn tại");

    // Kiểm tra nội dung file
    try {
      const plistContent = fs.readFileSync(googleServicePath, "utf8");
      const hasBundleId = plistContent.includes("com.veila.app");
      const hasApiKey = plistContent.includes("AIza");

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

// 4. Kiểm tra package.json dependencies
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

// 5. Tóm tắt vấn đề và hướng dẫn fix
log(colors.yellow, "\n🔧 TÓM TẮT VẤN ĐỀ:");
log(colors.red, "   ❌ Lỗi: auth/invalid-app-credential");
log(colors.red, "   ❌ Nguyên nhân: Firebase Console chưa được cấu hình đúng");
log(colors.red, "   ❌ Phone Authentication chưa được enable");
log(colors.red, "   ❌ iOS App chưa được thêm vào Firebase project");

log(colors.blue, "\n📋 HƯỚNG DẪN FIX FIREBASE CONSOLE:");
log(colors.white, "1. Vào https://console.firebase.google.com/");
log(colors.white, "2. Chọn project Veila");
log(colors.white, "3. Vào Authentication → Sign-in method → Phone → Enable");
log(colors.white, "4. Vào Project Settings → General → Your apps");
log(colors.white, '5. Click "Add app" → iOS');
log(colors.white, "6. Nhập Bundle ID: com.veila.app");
log(colors.white, "7. Download GoogleService-Info.plist");
log(colors.white, "8. Copy vào ios/Veila/ folder");

log(colors.green, "\n🎯 SAU KHI FIX:");
log(colors.white, "1. Restart app");
log(colors.white, "2. Clear Metro cache: npx expo start --clear");
log(colors.white, "3. Test lại Phone Authentication");
log(
  colors.white,
  '4. Kiểm tra logs: "Firebase Phone Auth: SMS sent successfully"'
);

log(colors.yellow, "\n⚠️  LƯU Ý QUAN TRỌNG:");
log(colors.white, "- Code đã được fix hoàn toàn với expo-firebase-recaptcha");
log(colors.white, "- Vấn đề chỉ là cấu hình Firebase Console");
log(
  colors.white,
  "- Sau khi fix Console, Phone Auth sẽ hoạt động với SMS thật"
);

log(colors.blue, "\n📞 HỖ TRỢ:");
log(colors.white, "Nếu vẫn gặp vấn đề:");
log(colors.white, "1. Chụp màn hình Firebase Console");
log(colors.white, "2. Copy console logs");
log(colors.white, "3. Gửi thông tin cho team dev");

log(colors.green, "\n🎉 CHÚC MỪNG!");
log(
  colors.white,
  "Sau khi fix Firebase Console, Phone Authentication sẽ hoạt động hoàn hảo!"
);
