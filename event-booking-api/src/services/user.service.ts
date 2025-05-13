import prisma from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/error";

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class UserService {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns The created user (without password) and auth token
   */
  async register(userData: CreateUserInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password and token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Login a user
   * @param loginData User login credentials
   * @returns The logged in user (without password) and auth token
   */
  async login(loginData: LoginInput) {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
