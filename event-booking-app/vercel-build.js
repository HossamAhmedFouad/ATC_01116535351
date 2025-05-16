const fs = require("fs");
const path = require("path");

// Function to replace placeholders in the env-config.js file
function generateEnvConfig() {
  // First create the build directory if it doesn't exist
  const buildDir = path.join(__dirname, "dist", "event-booking-app");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const envConfig = `(function(window) {
    window.env = window.env || {};
    window.env.SUPABASE_URL = '${process.env.SUPABASE_URL || ""}';
    window.env.SUPABASE_ANON_KEY = '${process.env.SUPABASE_ANON_KEY || ""}';
    window.env.SUPABASE_STORAGE_URL = '${
      process.env.SUPABASE_STORAGE_URL || ""
    }';
    window.env.API_URL = '${
      process.env.API_URL || "https://your-api-url.com/api"
    }';
  })(this);`;

  // Write the env-config.js to the build output directory
  fs.writeFileSync(path.join(buildDir, "env-config.js"), envConfig);
}

// Generate the environment configuration
generateEnvConfig();
