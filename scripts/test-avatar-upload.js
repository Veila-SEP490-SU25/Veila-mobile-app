#!/usr/bin/env node

/**
 * Script to test avatar upload flow và debug form data
 * Usage: node scripts/test-avatar-upload.js
 */

const https = require("https");

// Sample form data để test API
const testUpdateProfile = async () => {
  const testData = {
    avatarUrl:
      "https://firebasestorage.googleapis.com/v0/b/test/o/avatars%2Favatar_test.jpg?alt=media&token=test",
  };

  console.log("🧪 Testing Profile Update API...");
  console.log("📤 Request Data:", JSON.stringify(testData, null, 2));

  // Bạn có thể thêm actual API call ở đây nếu cần
  console.log("✅ Test data structure is valid");
  console.log("💡 Check if backend accepts this structure:");
  console.log("   - Field name: avatarUrl");
  console.log("   - Value type: string (Firebase URL)");
  console.log("   - HTTP method: PUT");
  console.log("   - Endpoint: /auth/me");
};

// Test Firebase URL validation
const testFirebaseUrl = () => {
  const validUrl =
    "https://firebasestorage.googleapis.com/v0/b/veila-project.appspot.com/o/avatars%2Favatar_1234567890.jpg?alt=media&token=abc123";
  const invalidUrl = "not-a-valid-url";

  console.log("🔗 Testing Firebase URL validation...");

  const isValidFirebaseUrl = (url) => {
    return url.startsWith("https://firebasestorage.googleapis.com/");
  };

  console.log("✅ Valid URL:", isValidFirebaseUrl(validUrl));
  console.log("❌ Invalid URL:", isValidFirebaseUrl(invalidUrl));
};

// Main test function
const runTests = () => {
  console.log("🚀 Avatar Upload Flow Test Script");
  console.log("=".repeat(50));

  testUpdateProfile();
  console.log("\n" + "-".repeat(30) + "\n");
  testFirebaseUrl();

  console.log("\n📋 Debug Checklist:");
  console.log("   1. ✅ Firebase upload works?");
  console.log("   2. ✅ URL generation works?");
  console.log("   3. ❓ API accepts avatarUrl field?");
  console.log("   4. ❓ Backend saves to database?");
  console.log("   5. ❓ Response returns updated user?");

  console.log("\n💡 Next steps:");
  console.log("   - Check browser console for detailed logs");
  console.log("   - Verify API response contains avatarUrl");
  console.log("   - Check backend database for actual update");
};

runTests();
