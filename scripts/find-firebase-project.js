#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🔍 Finding Firebase project for Veila...");

try {

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

  console.log("\n📋 Available Firebase projects:");
  const projectsOutput = execSync("firebase projects:list", {
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });

  console.log(projectsOutput);

  const lines = projectsOutput.split("\n").filter((line) => line.trim());
  const projects = [];

  for (const line of lines) {
    if (line.includes("│") || line.includes("─")) continue;

    const parts = line.split(/\s+/).filter((part) => part.trim());
    if (parts.length >= 2) {
      const projectId = parts[0];
      const projectName = parts.slice(1).join(" ");
      projects.push({ id: projectId, name: projectName });
    }
  }

  console.log("\n🔍 Searching for Veila-related projects...");

  const veilaProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes("veila") ||
      project.id.toLowerCase().includes("veila") ||
      project.name.toLowerCase().includes("wedding") ||
      project.name.toLowerCase().includes("dress")
  );

  if (veilaProjects.length > 0) {
    console.log("🎯 Found Veila-related projects:");
    veilaProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (${project.id})`);
    });

    const selectedProject = veilaProjects[0];
    console.log(
      `\n🎯 Using project: ${selectedProject.name} (${selectedProject.id})`
    );

    execSync(`firebase use ${selectedProject.id}`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    console.log("\n✅ Project set successfully!");
    console.log("📝 You can now run: npm run deploy-indexes");
  } else {
    console.log("\n⚠️  No Veila-related projects found!");
    console.log("📝 Available projects:");
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (${project.id})`);
    });

    console.log("\n🔧 Please select a project manually:");
    console.log("1. Copy the project ID from the list above");
    console.log("2. Set project: firebase use <PROJECT_ID>");
    console.log("3. Verify: firebase use");
    console.log("4. Deploy indexes: npm run deploy-indexes");

    process.exit(1);
  }
} catch (error) {
  console.error("❌ Failed to find Firebase project:", error.message);
  console.log("\n🔧 Manual steps:");
  console.log("1. Login: firebase login");
  console.log("2. List projects: firebase projects:list");
  console.log("3. Find your project in the list");
  console.log("4. Set project: firebase use <PROJECT_ID>");
  console.log("5. Verify: firebase use");
  console.log("6. Deploy indexes: npm run deploy-indexes");
  process.exit(1);
}
