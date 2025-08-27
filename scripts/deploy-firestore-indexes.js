#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Deploying Firestore indexes...");

try {

  let currentProject = "";
  try {
    currentProject = execSync("firebase use", {
      stdio: "pipe",
      encoding: "utf8",
      cwd: path.join(__dirname, ".."),
    }).trim();
    console.log(`✅ Using Firebase project: ${currentProject}`);
  } catch (error) {
    console.log("🔧 No project set, trying to detect available projects...");

    const projectsOutput = execSync("firebase projects:list", {
      encoding: "utf8",
      cwd: path.join(__dirname, ".."),
    });

    console.log("📋 Available projects:");
    console.log(projectsOutput);

    if (projectsOutput.includes("veilastudio")) {
      console.log("🎯 Found veilastudio project, setting it as active...");
      execSync("firebase use veilastudio", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
      currentProject = "veilastudio";
    } else if (projectsOutput.includes("veila")) {
      console.log("🎯 Found veila project, setting it as active...");
      const veilaProject = projectsOutput
        .split("\n")
        .find((line) => line.includes("veila"));
      if (veilaProject) {
        const projectId = veilaProject.split(/\s+/)[0];
        execSync(`firebase use ${projectId}`, {
          stdio: "inherit",
          cwd: path.join(__dirname, ".."),
        });
        currentProject = projectId;
      }
    } else {
      console.log(
        "⚠️  No suitable project found. Please set project manually:"
      );
      console.log("firebase use <PROJECT_ID>");
      process.exit(1);
    }
  }

  console.log(`🚀 Deploying indexes to project: ${currentProject}`);
  execSync("firebase deploy --only firestore:indexes", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("✅ Firestore indexes deployed successfully!");
  console.log(
    "📝 Note: It may take a few minutes for indexes to be fully active."
  );
} catch (error) {
  console.error("❌ Failed to deploy Firestore indexes:", error.message);
  console.log("\n🔧 Manual steps:");
  console.log("1. Check available projects: firebase projects:list");
  console.log("2. Set project: firebase use <PROJECT_ID>");
  console.log("3. Deploy indexes: firebase deploy --only firestore:indexes");
  console.log(
    "4. Or open Firebase Console: https://console.firebase.google.com"
  );
  console.log("5. Select your project and go to Firestore Database > Indexes");
  process.exit(1);
}
