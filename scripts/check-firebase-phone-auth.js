#!/usr/bin/env node

/**
 * Script kiểm tra Firebase Phone Authentication configuration
 * Chạy: node scripts/check-firebase-phone-auth.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Kiểm tra Firebase Phone Authentication Configuration...\n");

// 1. Kiểm tra app.json
console.log("1️⃣ Kiểm tra app.json:");
try {
  const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
  const iosBundleId = appJson.expo?.ios?.bundleIdentifier;
  const androidPackage = appJson.expo?.android?.package;

  console.log(`   iOS Bundle ID: ${iosBundleId || "❌ Không có"}`);
  console.log(`   Android Package: ${androidPackage || "❌ Không có"}`);

  if (!iosBundleId && !androidPackage) {
    console.log("   ⚠️  Cần thêm bundleIdentifier/package vào app.json");
  }
} catch (error) {
  console.log("   ❌ Không thể đọc app.json:", error.message);
}

// 2. Kiểm tra app.config.js
console.log("\n2️⃣ Kiểm tra app.config.js:");
try {
  const appConfigContent = fs.readFileSync("app.config.js", "utf8");
  const firebaseVars = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
    "FIREBASE_MEASUREMENT_ID",
  ];

  firebaseVars.forEach((varName) => {
    const hasVar = appConfigContent.includes(varName);
    console.log(`   ${varName}: ${hasVar ? "✅ Có" : "❌ Không có"}`);
  });
} catch (error) {
  console.log("   ❌ Không thể đọc app.config.js:", error.message);
}

// 3. Kiểm tra .env
console.log("\n3️⃣ Kiểm tra .env file:");
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

    firebaseVars.forEach((varName) => {
      const hasVar = envContent.includes(varName);
      console.log(`   ${varName}: ${hasVar ? "✅ Có" : "❌ Không có"}`);
    });
  } else {
    console.log("   ❌ Không tìm thấy .env file");
  }
} catch (error) {
  console.log("   ❌ Không thể đọc .env:", error.message);
}

// 4. Hướng dẫn fix Firebase Console
console.log("\n🔧 HƯỚNG DẪN FIX FIREBASE CONSOLE:");
console.log("1. Vào https://console.firebase.google.com/");
console.log("2. Chọn project Veila");
console.log("3. Vào Authentication → Sign-in method");
console.log("4. Enable Phone provider");
console.log("5. Vào Project Settings → General");
console.log("6. Kiểm tra app có bundleIdentifier: com.veila.app");
console.log('7. Nếu chưa có app, click "Add app" → iOS');
console.log("8. Nhập Bundle ID: com.veila.app");
console.log("9. Download google-services.plist và thêm vào iOS project");

// 5. Kiểm tra iOS project
console.log("\n4️⃣ Kiểm tra iOS project:");
const iosProjectPath = path.join(__dirname, "..", "ios");
if (fs.existsSync(iosProjectPath)) {
  console.log("   ✅ iOS project tồn tại");

  // Kiểm tra GoogleService-Info.plist
  const googleServicePath = path.join(
    iosProjectPath,
    "Veila",
    "GoogleService-Info.plist"
  );
  if (fs.existsSync(googleServicePath)) {
    console.log("   ✅ GoogleService-Info.plist tồn tại");
  } else {
    console.log("   ❌ GoogleService-Info.plist không tồn tại");
    console.log(
      "   📥 Cần download từ Firebase Console và thêm vào ios/Veila/"
    );
  }
} else {
  console.log("   ❌ iOS project không tồn tại");
  console.log("   💡 Chạy: npx expo prebuild để tạo iOS project");
}

console.log("\n🎯 SAU KHI FIX FIREBASE CONSOLE:");
console.log("1. Restart app");
console.log("2. Clear Metro cache: npx expo start --clear");
console.log("3. Test lại Phone Authentication");
console.log('4. Kiểm tra logs: "Firebase Phone Auth: SMS sent successfully"');

console.log("\n📞 Nếu vẫn gặp vấn đề:");
console.log("- Chụp màn hình Firebase Console");
console.log("- Copy console logs");
console.log("- Gửi thông tin cho team dev");
