#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🔧 Setting up Firebase project configuration...");

try {
  // Check if already logged in
  try {
    execSync("firebase projects:list", {
      stdio: "pipe",
      cwd: path.join(__dirname, ".."),
    });
    console.log("✅ Firebase CLI is logged in");
  } catch (error) {
    console.log("🔐 Please login to Firebase first...");
    execSync("firebase login", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
  }

  // List available projects
  console.log("\n📋 Available Firebase projects:");
  const projectsOutput = execSync("firebase projects:list", {
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });

  console.log(projectsOutput);

  // Check if veilastudio exists
  if (projectsOutput.includes("veilastudio")) {
    console.log("\n🎯 Found veilastudio project! Setting it as active...");
    execSync("firebase use veilastudio", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
  } else {
    console.log('\n⚠️  Project "veilastudio" not found!');
    console.log(
      "📝 Please check the project list above and use the correct project ID."
    );
    console.log("\n🔧 Manual steps:");
    console.log("1. Copy the correct project ID from the list above");
    console.log("2. Set project: firebase use <PROJECT_ID>");
    console.log("3. Verify: firebase use");
    console.log("4. Deploy indexes: npm run deploy-indexes");

    // Try to get current project
    try {
      const currentProject = execSync("firebase use", {
        encoding: "utf8",
        cwd: path.join(__dirname, ".."),
      });
      console.log("\n📍 Current project:", currentProject.trim());
    } catch (error) {
      console.log("❌ No project currently set");
    }

    process.exit(1);
  }

  // Verify project is set
  console.log("\n✅ Current Firebase project:");
  execSync("firebase use", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("\n🚀 Firebase project setup complete!");
  console.log("📝 You can now run: npm run deploy-indexes");
} catch (error) {
  console.error("❌ Failed to setup Firebase project:", error.message);
  console.log("\n🔧 Manual setup steps:");
  console.log("1. Login: firebase login");
  console.log("2. List projects: firebase projects:list");
  console.log("3. Find your project ID in the list");
  console.log("4. Set project: firebase use <PROJECT_ID>");
  console.log("5. Verify: firebase use");
  console.log("6. Deploy indexes: npm run deploy-indexes");
  process.exit(1);
}
