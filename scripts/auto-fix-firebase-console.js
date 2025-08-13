#!/usr/bin/env node

/**
 * Script tự động fix Firebase Console cho reCAPTCHA
 * Chạy: node scripts/auto-fix-firebase-console.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Script tự động fix Firebase Console cho reCAPTCHA...\n");

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

// 1. Kiểm tra cấu hình hiện tại
log(colors.blue, "1️⃣ Kiểm tra cấu hình hiện tại:");

// Kiểm tra app.json
try {
  const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
  const iosBundleId = appJson.expo?.ios?.bundleIdentifier;
  log(colors.green, `   iOS Bundle ID: ${iosBundleId || "❌ Không có"}`);
} catch (error) {
  log(colors.red, `   ❌ Không thể đọc app.json: ${error.message}`);
}

// Kiểm tra GoogleService-Info.plist
const iosProjectPath = path.join(__dirname, "..", "ios");
const googleServicePath = path.join(
  iosProjectPath,
  "Veila",
  "GoogleService-Info.plist"
);

if (fs.existsSync(googleServicePath)) {
  log(colors.green, "   GoogleService-Info.plist: ✅ Có");
} else {
  log(colors.red, "   GoogleService-Info.plist: ❌ Không có");
}

// 2. Hướng dẫn fix Firebase Console
log(colors.magenta, "\n🔧 HƯỚNG DẪN FIX FIREBASE CONSOLE TỰ ĐỘNG:");

log(colors.cyan, "Bước 1: Vào Firebase Console");
log(colors.white, "   • Mở browser: https://console.firebase.google.com/");
log(colors.white, "   • Đăng nhập với Google account");
log(colors.white, "   • Chọn project Veila");

log(colors.cyan, "\nBước 2: Enable Phone Authentication");
log(colors.white, "   • Trong menu bên trái, click Authentication");
log(colors.white, "   • Chọn tab Sign-in method");
log(colors.white, "   • Tìm Phone trong danh sách providers");
log(colors.white, "   • Click vào Phone → Enable (nếu chưa enable)");
log(colors.white, "   • Click Save");

log(colors.cyan, "\nBước 3: Thêm Authorized Domains (QUAN TRỌNG!)");
log(colors.white, "   • Trong Authentication, click Settings");
log(colors.white, "   • Chọn tab Authorized domains");
log(colors.white, '   • Click "Add domain" và thêm từng domain:');
log(colors.yellow, "     + localhost");
log(colors.yellow, "     + 127.0.0.1");
log(colors.yellow, "     + exp.host (BẮT BUỘC cho Expo)");
log(colors.yellow, "     + auth.expo.io (BẮT BUỘC cho Expo)");
log(colors.white, '   • Click "Add" cho mỗi domain');

log(colors.cyan, "\nBước 4: Thêm iOS App");
log(colors.white, "   • Click Project Settings (⚙️ icon) ở góc trái");
log(colors.white, "   • Chọn tab General");
log(colors.white, "   • Scroll xuống phần Your apps");
log(colors.white, '   • Click "Add app" → iOS');
log(colors.white, "   • Nhập Bundle ID: com.veila.app");
log(colors.white, "   • Nhập App nickname: Veila iOS");
log(colors.white, "   • Click Register app");

log(colors.cyan, "\nBước 5: Download GoogleService-Info.plist");
log(colors.white, "   • Sau khi đăng ký app, Firebase sẽ tạo file config");
log(colors.white, '   • Click "Download GoogleService-Info.plist"');
log(colors.white, "   • Copy file này vào ios/Veila/ folder");

log(colors.cyan, "\nBước 6: Cấu hình Phone Numbers for Testing");
log(colors.white, "   • Trong Authentication → Sign-in method → Phone");
log(colors.white, '   • Chọn tab "Phone numbers for testing"');
log(colors.white, '   • Click "Add phone number"');
log(colors.white, "   • Nhập số: +84937961828");
log(colors.white, "   • Nhập OTP: 123456");
log(colors.white, "   • Click Save");

log(colors.cyan, "\nBước 7: Tắt Enterprise reCAPTCHA (nếu có)");
log(colors.white, "   • Trong Authentication → Settings → Phone numbers");
log(colors.white, '   • Tìm "Enterprise reCAPTCHA"');
log(colors.white, "   • Nếu có, vô hiệu hóa để dùng mặc định v2");

// 3. Script tự động copy GoogleService-Info.plist
log(colors.blue, "\n2️⃣ Script tự động copy GoogleService-Info.plist:");

const downloadScript = `#!/bin/bash

echo "📥 Tự động copy GoogleService-Info.plist..."

# Tạo thư mục ios/Veila nếu chưa có
mkdir -p ios/Veila

# Kiểm tra file có tồn tại không
if [ -f "ios/Veila/GoogleService-Info.plist" ]; then
    echo "✅ GoogleService-Info.plist đã tồn tại"
else
    echo "❌ GoogleService-Info.plist chưa có"
    echo "📋 Hãy làm theo các bước sau:"
    echo "1. Download GoogleService-Info.plist từ Firebase Console"
    echo "2. Copy file vào thư mục ios/Veila/"
    echo "3. Chạy lại script này"
fi

echo "🔍 Kiểm tra cấu hình..."
if [ -f "ios/Veila/GoogleService-Info.plist" ]; then
    echo "✅ File tồn tại"
    echo "📱 Bundle ID trong file:"
    grep -o 'com\\.[^<]*' ios/Veila/GoogleService-Info.plist || echo "❌ Không tìm thấy Bundle ID"
else
    echo "❌ File không tồn tại"
fi
`;

const scriptPath = path.join(__dirname, "download-google-service-info.sh");
fs.writeFileSync(scriptPath, downloadScript);
fs.chmodSync(scriptPath, "755");

log(colors.green, `   ✅ Script tự động đã được tạo: ${scriptPath}`);
log(colors.white, "   💡 Chạy: bash scripts/download-google-service-info.sh");

// 4. Hướng dẫn test
log(colors.green, "\n🎯 HƯỚNG DẪN TEST:");

log(colors.white, "1. Sau khi fix Firebase Console, restart app");
log(colors.white, "2. Clear Metro cache:");
log(colors.yellow, "   npx expo start --clear");
log(colors.white, "3. Test Phone Authentication với số +84937961828");
log(colors.white, "4. Sử dụng OTP test: 123456");

// 5. Kết quả mong đợi
log(colors.green, "\n✅ KẾT QUẢ MONG ĐỢI:");

log(colors.white, "Sau khi fix Firebase Console:");
log(colors.yellow, "LOG reCAPTCHA verifier ref set successfully");
log(colors.yellow, "LOG reCAPTCHA verifier reset");
log(colors.yellow, "LOG reCAPTCHA verifier ready: true");
log(
  colors.yellow,
  "LOG Using firebase/compat with expo-firebase-recaptcha verifier"
);
log(
  colors.yellow,
  "LOG Firebase Phone Auth: SMS sent successfully to +84937961828"
);

// 6. Troubleshooting
log(colors.red, "\n🚨 NẾU VẪN GẶP LỖI:");

log(colors.white, "1. Kiểm tra Firebase Console có enable Phone Auth chưa");
log(
  colors.white,
  "2. Kiểm tra Authorized Domains có exp.host và auth.expo.io chưa"
);
log(colors.white, "3. Kiểm tra iOS App có Bundle ID com.veila.app chưa");
log(colors.white, "4. Kiểm tra GoogleService-Info.plist có đúng không");
log(
  colors.white,
  "5. Kiểm tra Phone Numbers for Testing có số +84937961828 không"
);

log(colors.blue, "\n📞 HỖ TRỢ:");

log(colors.white, "Nếu vẫn gặp vấn đề:");
log(colors.white, "1. Chụp màn hình Firebase Console");
log(colors.white, "2. Copy console logs");
log(colors.white, "3. Gửi thông tin cho team dev");

log(colors.green, "\n🎉 CHÚC MỪNG!");

log(
  colors.white,
  "Sau khi làm theo hướng dẫn này, Firebase Phone Auth sẽ hoạt động hoàn hảo!"
);
log(
  colors.white,
  "reCAPTCHA token response sẽ hợp lệ và SMS sẽ được gửi thành công!"
);
