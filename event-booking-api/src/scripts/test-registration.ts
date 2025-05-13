// This is a test script to check if user registration works correctly
import { UserService } from "../services/user.service";

const userService = new UserService();

async function testUserRegistration() {
  try {
    // Generate a unique email to avoid conflicts
    const timestamp = new Date().getTime();
    const testUser = {
      username: `test_user_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: "Test123456!",
      phone: "+1234567890",
      location: "Test City",
      bio: "Test bio",
    };

    console.log("Attempting to register a new user:", testUser.email);
    const result = await userService.register(testUser);
    console.log("Registration successful!");
    console.log("User ID:", result.user.id.toString());
    console.log("JWT Token:", result.token);
    return result;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}

// Execute the test
testUserRegistration()
  .then(() => console.log("Test completed"))
  .catch((error) => console.error("Test failed:", error))
  .finally(() => process.exit());
