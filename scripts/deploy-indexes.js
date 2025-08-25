#!/usr/bin/env node

/**
 * Script to deploy Firestore indexes
 * Run: node scripts/deploy-indexes.js
 */

const { execSync } = require("child_process");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const indexesFile = path.join(projectRoot, "firestore-indexes.json");

console.log("🚀 Deploying Firestore indexes...");

try {
  // Check if Firebase CLI is installed
  try {
    execSync("firebase --version", { stdio: "pipe" });
  } catch (error) {
    console.error("❌ Firebase CLI not found. Please install it first:");
    console.error("npm install -g firebase-tools");
    process.exit(1);
  }

  // Check if logged in to Firebase
  try {
    execSync("firebase projects:list", { stdio: "pipe" });
  } catch (error) {
    console.error("❌ Not logged in to Firebase. Please login first:");
    console.error("firebase login");
    process.exit(1);
  }

  // Deploy indexes
  console.log("📦 Deploying Firestore indexes...");
  const result = execSync(`firebase deploy --only firestore:indexes`, {
    cwd: projectRoot,
    stdio: "inherit",
  });

  console.log("✅ Firestore indexes deployed successfully!");
  console.log("");
  console.log("🔗 You can view your indexes at:");
  console.log(
    "https://console.firebase.google.com/project/veilastudio/firestore/indexes"
  );
} catch (error) {
  console.error("❌ Error deploying indexes:", error.message);

  console.log("");
  console.log("📝 Manual steps to create indexes:");
  console.log(
    "1. Go to Firebase Console: https://console.firebase.google.com/project/veilastudio/firestore/indexes"
  );
  console.log('2. Click "Create Index"');
  console.log("3. Create these composite indexes:");
  console.log("");
  console.log("   For notifications collection:");
  console.log("   - userId (Ascending) + timestamp (Descending)");
  console.log("   - userId (Ascending) + isRead (Ascending)");
  console.log("");
  console.log("   For chatRooms collection:");
  console.log("   - customerId (Ascending) + updatedAt (Descending)");
  console.log("   - shopId (Ascending) + updatedAt (Descending)");
  console.log("");
  console.log("   For messages collection:");
  console.log("   - chatRoomId (Ascending) + timestamp (Ascending)");
  console.log(
    "   - chatRoomId (Ascending) + isRead (Ascending) + senderId (Ascending)"
  );

  process.exit(1);
}
