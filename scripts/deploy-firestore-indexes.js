#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Deploying Firestore indexes...");

try {
  // Check if firebase CLI is installed
  try {
    execSync("firebase --version", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Firebase CLI is not installed. Please install it first:");
    console.error("npm install -g firebase-tools");
    process.exit(1);
  }

  // Check if firebase project is initialized
  if (!fs.existsSync("firebase.json")) {
    console.error("❌ Firebase project is not initialized. Please run:");
    console.error("firebase init firestore");
    process.exit(1);
  }

  // Deploy indexes
  console.log("📦 Deploying indexes to Firebase...");
  execSync("firebase deploy --only firestore:indexes", { stdio: "inherit" });

  console.log("✅ Firestore indexes deployed successfully!");
  console.log("⏳ Please wait a few minutes for indexes to be built...");
} catch (error) {
  console.error("❌ Error deploying Firestore indexes:", error.message);
  process.exit(1);
}
