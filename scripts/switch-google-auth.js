#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../utils/google-auth.config.ts");
const loginPath = path.join(__dirname, "../app/_auth/login.tsx");

function switchToMockMode() {
  console.log("🔄 Chuyển sang Mock Mode...");

  let configContent = fs.readFileSync(configPath, "utf8");
  configContent = configContent.replace(/USE_MOCK: false/, "USE_MOCK: true");
  fs.writeFileSync(configPath, configContent);

  let loginContent = fs.readFileSync(loginPath, "utf8");
  loginContent = loginContent.replace(
    /import { GoogleOAuthButton } from "\.\.\/\.\.\/components\/auth\/login\/GoogleOAuthButton";/,
    'import { GoogleLoginButton } from "../../components/auth/login/GoogleLoginButton";'
  );
  loginContent = loginContent.replace(
    /<GoogleOAuthButton \/>/,
    "<GoogleLoginButton />"
  );
  fs.writeFileSync(loginPath, loginContent);

  console.log("✅ Đã chuyển sang Mock Mode");
  console.log("📝 Sử dụng mock data để test Google login");
}

function switchToRealMode() {
  console.log("🔄 Chuyển sang Real Mode...");

  let configContent = fs.readFileSync(configPath, "utf8");
  configContent = configContent.replace(/USE_MOCK: true/, "USE_MOCK: false");
  fs.writeFileSync(configPath, configContent);

  let loginContent = fs.readFileSync(loginPath, "utf8");
  loginContent = loginContent.replace(
    /import { GoogleLoginButton } from "\.\.\/\.\.\/components\/auth\/login\/GoogleLoginButton";/,
    'import { GoogleOAuthButton } from "../../components/auth/login/GoogleOAuthButton";'
  );
  loginContent = loginContent.replace(
    /<GoogleLoginButton \/>/,
    "<GoogleOAuthButton />"
  );
  fs.writeFileSync(loginPath, loginContent);

  console.log("✅ Đã chuyển sang Real Mode");
  console.log("🔧 Đảm bảo đã cấu hình Firebase và Client IDs");
}

function showStatus() {
  const configContent = fs.readFileSync(configPath, "utf8");
  const isMock = configContent.includes("USE_MOCK: true");

  console.log("📊 Trạng thái hiện tại:");
  console.log(`   Mode: ${isMock ? "Mock" : "Real"}`);
  console.log(`   Config: ${isMock ? "USE_MOCK: true" : "USE_MOCK: false"}`);

  if (isMock) {
    console.log(
      "💡 Để chuyển sang Real Mode: node scripts/switch-google-auth.js real"
    );
  } else {
    console.log(
      "💡 Để chuyển sang Mock Mode: node scripts/switch-google-auth.js mock"
    );
  }
}

const command = process.argv[2];

switch (command) {
  case "mock":
    switchToMockMode();
    break;
  case "real":
    switchToRealMode();
    break;
  case "status":
    showStatus();
    break;
  default:
    console.log("🔧 Google Auth Mode Switcher");
    console.log("");
    console.log("Usage:");
    console.log(
      "  node scripts/switch-google-auth.js mock   - Chuyển sang Mock Mode"
    );
    console.log(
      "  node scripts/switch-google-auth.js real   - Chuyển sang Real Mode"
    );
    console.log(
      "  node scripts/switch-google-auth.js status - Xem trạng thái hiện tại"
    );
    console.log("");
    showStatus();
}
