#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🔄 Force rebuilding all Firestore indexes...");

try {
  // Check if project is set, if not set it to veilastudio
  try {
    execSync("firebase use", {
      stdio: "pipe",
      cwd: path.join(__dirname, ".."),
    });
  } catch (error) {
    console.log("🔧 Setting Firebase project to veilastudio...");
    execSync("firebase use veilastudio", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
  }

  // First, delete all existing indexes
  console.log("🗑️  Deleting existing indexes...");
  execSync("firebase firestore:indexes:delete --force", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  // Wait a moment
  console.log("⏳ Waiting for indexes to be deleted...");
  setTimeout(() => {
    try {
      // Deploy new indexes
      console.log("🚀 Deploying new indexes...");
      execSync("firebase deploy --only firestore:indexes", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });

      console.log("✅ All indexes have been rebuilt successfully!");
      console.log(
        "📝 Note: It may take 5-15 minutes for indexes to be fully active."
      );
      console.log("🔍 Check status: firebase firestore:indexes");
    } catch (error) {
      console.error("❌ Failed to deploy new indexes:", error.message);
      console.log("\n🔧 Manual steps:");
      console.log("1. Set Firebase project: firebase use veilastudio");
      console.log(
        "2. Delete indexes: firebase firestore:indexes:delete --force"
      );
      console.log(
        "3. Deploy indexes: firebase deploy --only firestore:indexes"
      );
      console.log(
        "4. Or open Firebase Console: https://console.firebase.google.com"
      );
      console.log("5. Select project: veilastudio");
      console.log("6. Go to Firestore Database > Indexes");
      console.log("7. Delete all existing indexes manually");
      console.log(
        "8. Deploy indexes: firebase deploy --only firestore:indexes"
      );
    }
  }, 3000);
} catch (error) {
  console.error("❌ Failed to delete existing indexes:", error.message);
  console.log("\n🔧 Try manual steps:");
  console.log("1. Set Firebase project: firebase use veilastudio");
  console.log("2. Delete indexes: firebase firestore:indexes:delete --force");
  console.log("3. Deploy indexes: firebase deploy --only firestore:indexes");
}
