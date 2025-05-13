import prisma from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/error";
import { users } from "../generated/prisma";

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
   */
  async register(userData: CreateUserInput) {
    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
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
    }); // Generate JWT token
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email || "",
      role: user.role || "USER",
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
    const user = await prisma.users.findFirst({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password
    if (!user.password) {
      throw new AppError("User has no password set", 401);
    }

    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email || "",
      role: user.role || "USER",
    }); // Return user without password and token
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Get user by ID
   * @param userId The ID of the user to retrieve
   * @returns The user data without password
   */
  async getUserById(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
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
    const user = await prisma.users.update({
      where: { id: BigInt(userId) },
      data: userData,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get all users (admin only)
   * @returns List of all users without passwords
   */
  async getAllUsers() {
    const users = await prisma.users.findMany();
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
