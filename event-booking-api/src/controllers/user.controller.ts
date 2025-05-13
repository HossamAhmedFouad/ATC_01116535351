import { Request, Response, NextFunction } from "express";
import {
  UserService,
  CreateUserInput,
  LoginInput,
  UpdateUserInput,
} from "../services/user.service";
import { AppError } from "../middleware/error";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserInput = req.body;

      // Validate required fields
      if (!userData.email || !userData.password || !userData.username) {
        throw new AppError("Username, email, and password are required", 400);
      }

      // Call service to register user
      const result = await this.userService.register(userData);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login a user
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginInput = req.body;

      // Validate required fields
      if (!loginData.email || !loginData.password) {
        throw new AppError("Email and password are required", 400);
      }

      // Call service to login user
      const result = await this.userService.login(loginData);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Get the current user's profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request (from auth middleware)
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      // Call service to get user by ID
      const user = await this.userService.getUserById(req.user.userId);

      res.status(200).json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request (from auth middleware)
      if (!req.user || !req.user.userId) {
        throw new AppError("Authentication required", 401);
      }

      const userData: UpdateUserInput = req.body;
      const updatedUser = await this.userService.updateUser(
        req.user.userId,
        userData
      );

      res.status(200).json({
        status: "success",
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users (admin only)
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({
        status: "success",
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  };
}
