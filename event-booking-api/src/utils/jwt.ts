import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Interface for the token payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 * @param payload The data to encode in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: TokenPayload): string => {
  // Use the simplest form of jwt.sign to avoid type errors
  return jwt.sign(payload, JWT_SECRET);
};

/**
 * Verify and decode a JWT token
 * @param token The token to verify
 * @returns The decoded token payload or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
