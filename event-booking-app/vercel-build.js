const fs = require("fs");
const path = require("path");

// Function to replace placeholders in the env-config.js file
function generateEnvConfig() {
  // Read the template file
  const templatePath = path.join(__dirname, "src", "env-config.js");
  let envConfig = fs.readFileSync(templatePath, "utf8");
  // Replace all placeholders with actual values
  envConfig = envConfig
    .replace("{{SUPABASE_URL}}", process.env.SUPABASE_URL || "")
    .replace(
      "{{API_URL}}",
      process.env.API_URL || "http://172.161.48.59:3000/api"
    );

  // Write back to the source file so Angular can use it during build
  fs.writeFileSync(templatePath, envConfig);

  // Also write to the build directory
  const buildDir = path.join(__dirname, "dist", "event-booking-app");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  fs.writeFileSync(path.join(buildDir, "env-config.js"), envConfig);
}

// Generate the environment configuration
generateEnvConfig();
