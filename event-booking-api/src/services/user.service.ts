import prisma from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/error";
import { users } from "../generated/prisma";
import { createLogger } from "../utils/logger";

// Create a logger for this service
const logger = createLogger("UserService");

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  username?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_url?: string;
}

export class UserService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns The created user (without password) and auth token
   */ async register(userData: CreateUserInput) {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: userData.email },
    });

    if (existingUser) {
      logger.warn(
        `Registration attempt with existing email: ${userData.email}`
      );
      throw new AppError("User with this email already exists", 409);
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    try {
      // Create the user - let Prisma handle UUID generation
      const user = await prisma.users.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          phone: userData.phone || null,
          location: userData.location || null,
          bio: userData.bio || null,
          role: "USER", // Default role
          profile_url: null,
        },
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email || "",
        role: user.role || "USER",
      });

      // Return user without password and token
      const { password, ...userWithoutPassword } = user;
      logger.info(`User registered successfully: ${userData.email}`);
      return { user: userWithoutPassword, token };
    } catch (error: any) {
      logger.error("User creation error:", error);
      if (error.code === "P2002") {
        throw new AppError(
          `Unique constraint failed on field: ${error.meta?.target}`,
          409
        );
      }
      throw new AppError(
        "Failed to create user: " + (error.message || "Unknown error"),
        500
      );
    }
  }
  /**
   * Login a user
   * @param loginData User login credentials
   * @returns The logged in user (without password) and auth token
   */
  async login(loginData: LoginInput) {
    // Find the user
    const user = await prisma.users.findFirst({
      where: { email: loginData.email },
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${loginData.email}`);
      throw new AppError("Invalid email or password", 401);
    }

    // Check password
    if (!user.password) {
      logger.warn(`User has no password set: ${loginData.email}`);
      throw new AppError("User has no password set", 401);
    }

    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${loginData.email}`);
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email || "",
      role: user.role || "USER",
    });

    logger.info(`User logged in successfully: ${loginData.email}`);

    // Return user without password and token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
  /**
   * Get user by ID
   * @param userId The ID of the user to retrieve
   * @returns The user data without password
   */
  async getUserById(userId: string) {
    logger.debug(`Fetching user by ID: ${userId}`);
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn(`User not found with ID: ${userId}`);
      throw new AppError("User not found", 404);
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   * @param userId The ID of the user to update
   * @param userData The data to update
   * @returns The updated user without password
   */
  async updateUser(userId: string, userData: UpdateUserInput) {
    logger.debug(`Updating user profile for ID: ${userId}`);
    try {
      const user = await prisma.users.update({
        where: { id: userId },
        data: userData,
      });

      logger.info(`User profile updated successfully for ID: ${userId}`);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: any) {
      logger.error(`Failed to update user profile: ${userId}`, error);
      throw new AppError("Failed to update user profile", 500);
    }
  }

  /**
   * Get all users (admin only)
   * @returns List of all users without passwords
   */
  async getAllUsers() {
    logger.debug("Fetching all users");
    try {
      const users = await prisma.users.findMany();
      logger.info(`Retrieved ${users.length} users`);
      return users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error: any) {
      logger.error("Failed to retrieve all users", error);
      throw new AppError("Failed to retrieve users", 500);
    }
  }

  /**
   * Change user password
   * @param userId The ID of the user
   * @param currentPassword The current password to verify
   * @param newPassword The new password to set
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    logger.debug(`Changing password for user ID: ${userId}`);

    try {
      // Get the user with their current password hash
      const user = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        logger.warn(`User not found with ID: ${userId}`);
        throw new AppError("User not found", 404);
      }

      if (!user.password) {
        logger.warn(`User has no password set: ${userId}`);
        throw new AppError("User has no password set", 400);
      }

      // Verify current password
      const isPasswordValid = await comparePassword(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        logger.warn(`Invalid current password for user: ${userId}`);
        throw new AppError("Current password is incorrect", 401);
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the password
      await prisma.users.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info(`Password changed successfully for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to change password for user: ${userId}`, error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to change password", 500);
    }
  }
}
